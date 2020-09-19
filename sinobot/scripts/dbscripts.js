const formatscripts = require('./formatscripts.js')

const weaponsDB = require('../database/weaponsDB.json');
const armorDB = require('../database/armorDB.json');
const armorsetsDB = require('../database/armorsetsDB.json');
const nightmaresDB = require('../database/nightmaresDB.json');
const weaponsaliases = require('../database/weaponsaliases.json');
const weapontypesaliases = require('../database/weapontypesaliases.json');
const armoraliases = require('../database/armoraliases.json');
const nightmaresaliases = require('../database/nightmaresaliases.json');

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
module.exports.getItem = function(item, type){
    if (type == 'weapon'){
        if (!(item in weaponsDB)){
            item = weaponsaliases[item.toLowerCase()];
            if (item == null)
                return -1;
        }
        return [item, weaponsDB[item]];
    }
    else if (type == 'armor'){
        if (!(item in armorDB)){
            item = armoraliases[item.toLowerCase()];
            if (item == null)
                return -1;
        }
        return [item, armorDB[item]];
    }
    else if (type == 'nightmare'){
        if (!(item in nightmaresDB)){
            item = nightmaresaliases[item.toLowerCase()];
            if (item == null)
                return -1;
        }
        return [item, nightmaresDB[item]];
    }
    else
        return -1;
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
