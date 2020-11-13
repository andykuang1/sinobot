const formatscripts = require('./formatscripts.js')

const armorsets = require('../database/armorsets.json');
const weapontypesaliases = require('../database/weapontypesaliases.json');
const FuzzySet = require('fuzzyset.js');

const FUZZYCONST = 0.45;
// Initialize Database
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'PLACEHOLDERUSER',
    password : 'PLACEHOLDERPASSWORD',
    database : 'sinodb'
  },
  acquireConnectionTimeout: 10000
});

// ------------------------------------------------------ DB TABLE SCRIPTS ------------------------------------------------------

create_weapons_db_script = `CREATE TABLE weaponsDB(
    id INT auto_increment PRIMARY KEY,
    itemName VARCHAR(255) UNIQUE,
    icon VARCHAR(255),
    altName VARCHAR(255),
    ele VARCHAR(20),
    story_skill VARCHAR(255),
    colo_skill VARCHAR(255),
    item_type VARCHAR(20),
    colo_support VARCHAR(255),
    patk INT,
    pdef INT,
    matk INT,
    mdef INT,
    total_stat VARCHAR(20),
    total_atk INT,
    total_def INT,
    pdps INT,
    mdps INT,
    weapon_cost INT
    );`;

create_armor_db_script = `CREATE TABLE armorDB(
    id INT auto_increment PRIMARY KEY,
    itemName VARCHAR(255) UNIQUE,
    icon VARCHAR(255),
    altName VARCHAR(255),
    ele VARCHAR(20),
    effective_against VARCHAR(100),
    set_effect VARCHAR(255),
    item_type VARCHAR(20),
    pdef INT,
    mdef INT,
    total_stat VARCHAR(20),
    set_total VARCHAR(20),
    story_skill VARCHAR(255)
    );`;

create_nightmares_db_script = `CREATE TABLE nightmaresDB(
    id INT auto_increment PRIMARY KEY,
    itemName VARCHAR(255) UNIQUE,
    icon VARCHAR(255),
    altName VARCHAR(255),
    story_skill VARCHAR(255),
    colo_skill VARCHAR(255),
    base_patk INT,
    base_pdef INT,
    base_matk INT,
    base_mdef INT,
    base_total VARCHAR(20),
    evo_patk INT,
    evo_pdef INT,
    evo_matk INT,
    evo_mdef INT,
    evo_total VARCHAR(20),
    total_atk INT,
    total_def INT,
    pdps INT,
    mdps INT,
    prep_time INT,
    duration INT
    );`;

create_elements_db_script = `CREATE TABLE elementsDB(
    id INT auto_increment PRIMARY KEY,
    ele VARCHAR(20) UNIQUE
    );`;

create_weapons_alias_script = `CREATE TABLE weaponsaliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(255),
    FOREIGN KEY(originalName) REFERENCES weaponsDB(itemName)
    );`;

create_armor_alias_script = `CREATE TABLE armoraliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(255),
    FOREIGN KEY(originalName) REFERENCES armorDB(itemName)
    );`;

create_armorsets_alias_script = `CREATE TABLE armorsetsaliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(255)
    );`;

create_nightmare_alias_script = `CREATE TABLE nightmaresaliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(255),
    FOREIGN KEY(originalName) REFERENCES nightmaresDB(itemName)
    );`;

create_elements_alias_script = `CREATE TABLE elementsaliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(20)
    );`;

// ------------------------------------------------------ SELECTS ------------------------------------------------------

// Columns returned: originalName
module.exports.getOriginalName = async function(itemName, type){
    rows = await knex.select('originalName').from(`${type}aliases`).where('alias', '=', itemName).catch(err => console.log(err));
    if (rows === undefined || rows.length == 0)
        return -1;
    return rows[0].originalName;
};

// Columns returned: alias
module.exports.get_armorsets_aliases = async function(){
    data = await knex.select('alias').from('armorsetsaliases').catch(err => console.log(err));
    currentAliases = [];
    if (data !== undefined && data.length > 0)
        data.forEach(row => {currentAliases.push(row.alias);});
    return currentAliases;
};

// Returns the specified column of the given table
module.exports.get_column = async function(table, column){
    rows = await knex.select(column).from(table).catch(err => console.log(err));
    if (rows === undefined || rows.length == 0)
        return -1;
    return rows;
}

module.exports.getNumberOfItems = async function(table){
    rows = await knex.select('*').from(table).catch(err => console.log(err));
    if (rows === undefined || rows.length == 0)
        return -1;
    return rows.length;
}

// returns the full name of the armor item    ex. 2B's Goggles [Blade] / Nameless Youth's Hairband (Blade)
module.exports.getFullName = async function(item, itemWeapon){
    fullItemNameParens = await knex.select('originalName').from('armoraliases').where('alias', '=', `${item} (${weapontypesaliases[itemWeapon.toLowerCase()]})`).catch(function(){return -1;});
    if (fullItemNameParens !== undefined && fullItemNameParens.length != 0)
        return fullItemNameParens[0].originalName;

    fullItemNameBrackets = await knex.select('originalName').from('armoraliases').where('alias', '=', `${item} [${weapontypesaliases[itemWeapon.toLowerCase()]}]`).catch(function(){return -1;});
    if (fullItemNameBrackets !== undefined && fullItemNameBrackets.length != 0)
        return fullItemNameBrackets[0].originalName;

    return -1;
};

// Columns returned varies based on weapon, armor, nightmare, element, etc
module.exports.getItem = async function(item, type){
    itemNameRows = await knex.select('originalName').from(`${type}aliases`).where('alias', '=', item).catch(err => console.log(err));
    if (itemNameRows === undefined || itemNameRows == 0)
        return -1;
    results = await knex.select('*').from(`${type}db`).where('itemName', '=', itemNameRows[0].originalName).catch(err => console.log(err));
    if (results === undefined || results.length == 0)
        return -1;
    return results[0];
};

module.exports.getFuzzyItem = async function(item, type){
    // Get all items in database and create FuzzySet from it
    results = await knex.select('alias').from(`${type}aliases`).catch(err => console.log(err));
    fuzzyItems = FuzzySet();
    results.forEach(row => fuzzyItems.add(row.alias));
    allMatches = fuzzyItems.get(item);
    if (allMatches == undefined || allMatches.length == 0)
        return -1;
    // Add all matched results that pass threshold into return value
    returnValue = new Set();
    for (match of allMatches){
        if (match[0] > FUZZYCONST){
            originalName = await exports.getOriginalName(match[1], type);
            returnValue.add(originalName);
        }
    }
    if (returnValue == undefined || returnValue.size == 0)
        return -1;
    return returnValue;
};

// Returns all items that match filters
module.exports.getFilteredItems = async function(type, filters){
    data = await knex.select('*').from(`${type}db`).whereIn('ele', Array.from(filters['ele']))
        .whereIn('weapon_cost', Array.from(filters['cost']));
    if (data === undefined || data.length == 0)
        return -1;
    return data;
    //.where('items.itemType', 'like', `%${searchCriteria.itemType || ''}%`)
    //.where('items.category', 'like', `%${searchCriteria.category || ''}%`)
};

// Returns a set from armorsets.json
module.exports.getArmorSet = async function(baseName){
    if (!(baseName in armorsets)){
        originalName = await exports.getOriginalName(baseName, 'armorsets');
        if (originalName == -1)
            return -1;
        itemSet = armorsets[originalName];
        if (itemSet == null){
            return -1;
        }
    }
    else
        itemSet = armorsets[baseName];
    return itemSet;
};

// ------------------------------------------------------ INSERTS ------------------------------------------------------

module.exports.addAlias = async function(aliasToInsert, nameToInsert){
    knex.insert({alias: aliasToInsert, originalName: nameToInsert}).into('armorsetsaliases').catch(err => console.log(err));
};

// ------------------------------------------------------ CLEANUP ------------------------------------------------------

module.exports.close_connection = async function(){
    knex.destroy();
};