const dbscripts = require('./dbscripts.js');
const formatscripts = require('./formatscripts.js');

const armoraliases = require('../database/armoraliases.json');
const armorDB = require('../database/armorDB.json');
const setbonuses = require('../database/setbonuses.json');

const Discord = require('discord.js');

module.exports.createEmbedMessageItem = function(item, type){
    itemName = item[0];
    itemDetails = item[1];
    itemTitle = `${itemName} \n${itemDetails['altName']}`;
    itemThumbnail = {url: itemDetails['icon']};
    if (type == 'weapon'){
        itemUrl = `https://sinoalice.game-db.tw/weapons/${itemDetails['altName']}`;
        statsValue = formatscripts.formatWeaponStats(itemDetails);
        skillsValue = formatscripts.formatSkills(itemDetails, 'weapon');
    }
    else if (type == 'armor'){
        itemUrl = `https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`;
        statsValue = formatscripts.formatArmorStats(itemDetails);
        skillsValue = formatscripts.formatSkills(itemDetails, 'armor');
    }
    else if (type == 'nightmare'){
        itemUrl = `https://sinoalice.game-db.tw/nightmares/${itemDetails['altName']}`;
        statsValue = formatscripts.formatNightmareStats(itemDetails);
        skillsValue = formatscripts.formatSkills(itemDetails, 'nightmare');
    }
    else{
        console.log('Unrecognized type in createEmbedMessageItem');
        return -1;
    }
    embedMessage = new Discord.MessageEmbed({
    title: itemTitle,
    url: itemUrl,
    thumbnail: itemThumbnail,
    fields: [
        {
            name: 'Stats',
            value: statsValue
        },
        {
            name: 'Skills',
            value: skillsValue
        }
    ]
    });
    return embedMessage;
};

module.exports.createEmbedMessageArmorSet = function(itemSet, setName){
    baseName = setName[0];
    itemWeapon = setName[1];
    itemStats = ''
    for (item in itemSet){
        if (item != 'unique'){
            if ('unique' in itemSet)
                itemDetails = armorDB[itemSet[item]];
            else
                itemDetails = armorDB[dbscripts.getFullName(itemSet[item], itemWeapon)];
            itemStats += `[${itemSet[item]}](https://sinoalice.game-db.tw/armor/${itemDetails['altName']})`;
            itemStats += formatscripts.formatArmorStats(itemDetails);
        }
    }
    if ('unique' in itemSet)
        itemDetails = armorDB[itemSet['Body']];
    else
        itemDetails = armorDB[dbscripts.getFullName(itemSet['Body'], 'Blade')];
    itemStats += `\n**Total Set Stat: ${itemDetails['set_total'].replace('...', '')}**`;
    armorUrl = `https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`;
    embedMessage = new Discord.MessageEmbed({
        title: `${armoraliases[baseName]} Set`,
        url: `https://sinoalice.game-db.tw/setbonus/${setbonuses[armoraliases[baseName]]}`.replace(' ', '%20'),
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