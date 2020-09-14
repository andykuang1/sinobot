const armorDB = require('../database/armorDB.json');
const weaponsDB = require('../database/weaponsDB.json');
const weaponsaliases = require('../database/weaponsaliases.json');
const armoraliases = require('../database/armoraliases.json');
const armorsetsDB = require('../database/armorsetsDB.json');

function capitalize(item){
    return item[0].toUpperCase() + item.slice(1);
};

// returns the full name of the armor item    ex. 2B's Goggles [Blade] / Nameless Youth's Hairband (Blade)
module.exports.getFullName = function(itemSet, item, itemWeapon){
    fullItemNameParens = `${itemSet[item]} (${capitalize(itemWeapon)})`;
    fullItemNameBrackets = `${itemSet[item]} [${capitalize(itemWeapon)}]`;
    if (fullItemNameParens in armorDB)
        fullItemName = fullItemNameParens;
    else if (fullItemNameBrackets in armorDB)
        fullItemName = fullItemNameBrackets;
    else{
        console.log('The item was not found in the database');
        message.channel.send('The item was not found in the database');
        exit();
    }
    return fullItemName;
};

module.exports.getItem = function(commandArgument, type){
    if (type == 'weapon'){
        fullArgument = commandArgument.join(' ')
        if (!(fullArgument in weaponsDB)){
            item = weaponsaliases[fullArgument];
            if (item == null){
                return -1;
            }
        }
        else
            item = fullArgument;
        return weaponsDB[item];
    }
    else if (type == 'armor'){
        if (!(itemName in armorDB)){
            itemName = armoraliases[itemName];
            if (itemName == null){
                return -1;
            }
        }
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