const formatscripts = require('./formatscripts.js')

const armorDB = require('../database/armorDB.json');
const weaponsDB = require('../database/weaponsDB.json');
const weaponsaliases = require('../database/weaponsaliases.json');
const armoraliases = require('../database/armoraliases.json');
const armorsetsDB = require('../database/armorsetsDB.json');

// returns the full name of the armor item    ex. 2B's Goggles [Blade] / Nameless Youth's Hairband (Blade)
module.exports.getFullName = function(item, itemWeapon){
    fullItemNameParens = formatscripts.capitalize(`${item} (${itemWeapon})`);
    fullItemNameBrackets = formatscripts.capitalize(`${item} [${itemWeapon}]`);
    return fullItemNameParens;
    if (fullItemNameParens in armorDB){
        fullItemName = fullItemNameParens;
    }
    else if (fullItemNameBrackets in armorDB)
        fullItemName = fullItemNameBrackets;
    else
        return -1;
    return fullItemName;
};

module.exports.getItem = function(item, type){
    if (type == 'weapon'){
        if (!(item in weaponsDB)){
            item = weaponsaliases[item];
            if (item == null)
                return -1;
        }
        return [item, weaponsDB[item]];
    }
    else if (type == 'armor'){
        console.log(item);
        if (!(item in armorDB)){
            item = armoraliases[item];
            if (item == null)
                return -1;
        }
        return [item, armorDB[item]];
    }
};

module.exports.getArmorSet = function(baseName){
    if (!(baseName in armorsetsDB)){
        itemSet = armorsetsDB[armoraliases[baseName]];
        if (itemSet == null){
            return -1;
        }
    }
    else
        itemSet = armorsetsDB[baseName];
    return itemSet;
}