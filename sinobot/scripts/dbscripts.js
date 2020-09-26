const formatscripts = require('./formatscripts.js')

const armorDB = require('../database/armorDB.json');
const armorsetsDB = require('../database/armorsetsDB.json');
const nightmaresDB = require('../database/nightmaresDB.json');
const weaponsaliases = require('../database/weaponsaliases.json');
const weapontypesaliases = require('../database/weapontypesaliases.json');
const armoraliases = require('../database/armoraliases.json');
const nightmaresaliases = require('../database/nightmaresaliases.json');

// Initialize Database
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'PLACEHOLDERUSER',
    password : 'PLACEHOLDERPASSWORD',
    database : 'sinodb'
  }
});

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
    );`

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
    );`

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
    );`

create_weapons_alias_script = `CREATE TABLE weaponsaliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(255),
    FOREIGN KEY(originalName) REFERENCES weaponsDB(itemName)
    );`

create_armor_alias_script = `CREATE TABLE armoraliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(255),
    FOREIGN KEY(originalName) REFERENCES armorDB(itemName)
    );`

create_nightmare_alias_script = `CREATE TABLE nightmaresaliases(
    id INT auto_increment PRIMARY KEY,
    alias VARCHAR(255) UNIQUE,
    originalName VARCHAR(255),
    FOREIGN KEY(originalName) REFERENCES nightmaresDB(itemName)
    );`

dbDict = {
    'weapons': 'weaponsdb',
    'armor': 'armordb',
    'nightmares': 'nightmaresdb'
}

// returns the full name of the armor item    ex. 2B's Goggles [Blade] / Nameless Youth's Hairband (Blade)
module.exports.getFullName = function(item, itemWeapon){
    fullItemNameParens = armoraliases[`${item} (${weapontypesaliases[itemWeapon.toLowerCase()]})`.toLowerCase()];
    fullItemNameBrackets = armoraliases[`${item} [${weapontypesaliases[itemWeapon.toLowerCase()]}]`.toLowerCase()];
    if (fullItemNameParens in armorDB){
        fullItemName = fullItemNameParens;
    }
    else if (fullItemNameBrackets in armorDB)
        fullItemName = fullItemNameBrackets;
    else
        return -1;
    return fullItemName;
};

// returns [itemName, itemDetails]
module.exports.getItem = async function(item, type){
    results = await knex.select('*').from(`${type}db`).where('itemName', '=', item);
    return results;
    // function (err, result){
    //     if (err)
    //         return -1;
    //     if (type == 'weapons'){
    //         // if (!result){
    //         //     item = weaponsaliases[item.toLowerCase()];
    //         //     if (item == null)
    //         //         return -1;
    //         // }
    //         return [item, result];
    //     }
    //     else if (type == 'armor'){
    //         if (!(item in armorDB)){
    //             item = armoraliases[item.toLowerCase()];
    //             if (item == null)
    //                 return -1;
    //         }
    //         return [item, armorDB[item]];
    //     }
    //     else if (type == 'nightmares'){
    //         if (!(item in nightmaresDB)){
    //             item = nightmaresaliases[item.toLowerCase()];
    //             if (item == null)
    //                 return -1;
    //         }
    //         return [item, nightmaresDB[item]];
    //     }
    //     else
    //         return -1;
    // });
};

module.exports.getArmorSet = function(baseName){
    if (!(baseName in armorsetsDB)){
        itemSet = armorsetsDB[armoraliases[baseName.toLowerCase()]];
        if (itemSet == null){
            return -1;
        }
    }
    else
        itemSet = armorsetsDB[baseName];
    return itemSet;
}
