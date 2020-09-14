const dbscripts = require('./dbscripts.js');
const formatscripts = require('./formatscripts.js');

const armoraliases = require('../database/armoraliases.json');
const armorDB = require('../database/armorDB.json');

const Discord = require('discord.js');

module.exports.createEmbedMessageItem = function(itemDetails, type){
    if (type == 'weapon'){
        embedMessage = new Discord.MessageEmbed({
        title: `${item} (${itemDetails['altName']})`,
        url: `https://sinoalice.game-db.tw/weapons/${itemDetails['altName']}`,
        thumbnail: {url: itemDetails['icon']},
        fields: [
            {
                name: 'Stats',
                value: formatscripts.formatWeaponStats(itemDetails)
            },
            {
                name: 'Skills',
                value: formatscripts.formatSkills(itemDetails, 'weapon')
            }
        ]
        });
    }
    return embedMessage;
};

module.exports.createEmbedMessageArmorSet = function(itemSet, itemName){
    baseName = itemName[0];
    itemWeapon = itemName[1];
    itemStats = ''
    for (item in itemSet){
        if ('unique' in itemSet)
            itemDetails = armorDB[itemSet[item]];
        else
            itemDetails = armorDB[dbscripts.getFullName(itemSet, item, itemWeapon)];
        itemStats += `[${itemSet[item]}](${itemDetails['icon']})`;
        itemStats += formatscripts.formatArmorStats(itemDetails);
    }
    itemDetails = armorDB[dbscripts.getFullName(itemSet, 'Body', 'Blade')];
    itemStats += `\n**Total Set Stat: ${itemDetails['set_total'].replace('...', '')}**`;
    armorUrl = `https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`;
    embedMessage = new Discord.MessageEmbed({
        title: `${armoraliases[baseName]} Set`,
        url: `https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`.replace(' ', '%20'),
        thumbnail: {url: itemDetails['icon']},
        fields: [
            {
                name: 'Stats',
                value: itemStats
            },
            {
                name: 'Skills',
                value: formatscripts.formatSkills(itemDetails, 'armor')
            }
        ]
    });
    return embedMessage;
};