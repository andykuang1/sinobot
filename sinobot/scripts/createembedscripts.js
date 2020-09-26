const dbscripts = require('./dbscripts.js');
const formatscripts = require('./formatscripts.js');

const armoraliases = require('../database/armoraliases.json');
const armorDB = require('../database/armorDB.json');
const setbonuses = require('../database/setbonuses.json');

const Discord = require('discord.js');

module.exports.createEmbedMessageItem = function(item, type){
    itemTitle = `${item.itemName} \n${item.altName}`;
    itemThumbnail = {url: item.icon};
    if (type == 'weapons'){
        itemUrl = `https://sinoalice.game-db.tw/weapons/${item.altName.replace(' ', '%20')}`;
        statsValue = formatscripts.formatWeaponStats(item);
        skillsValue = formatscripts.formatSkills(item, 'weapon');
    }
    else if (type == 'armor'){
        itemUrl = `https://sinoalice.game-db.tw/armor/${itemDetails['altName'].replace(' ', '%20')}`;
        statsValue = formatscripts.formatArmorStats(itemDetails);
        skillsValue = formatscripts.formatSkills(itemDetails, 'armor');
    }
    else if (type == 'nightmares'){
        itemUrl = `https://sinoalice.game-db.tw/nightmares/${item.altName.replace(' ', '%20')}`;
        statsValue = formatscripts.formatNightmareStats(item);
        skillsValue = formatscripts.formatSkills(item, 'nightmare');
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
        if ((item != 'unique') && (item != 'special')){
            if ('unique' in itemSet){
                itemDetails = armorDB[itemSet[item]];
                individualPieceName = itemSet[item];
            }
            else{
                itemDetails = armorDB[dbscripts.getFullName(itemSet[item], itemWeapon)];
                individualPieceName = dbscripts.getFullName(itemSet[item], itemWeapon);
            }
            if (!itemDetails)
                console.log(`${baseName} is missing weapon type ${itemWeapon} in createEmbedMessageArmorSet`)
            itemStats += `[${individualPieceName}](https://sinoalice.game-db.tw/armor/${itemDetails['altName'].replace(' ', '%20')})`;
            itemStats += formatscripts.formatArmorStats(itemDetails);
        }
    }
    if ('unique' in itemSet){
        itemDetails = armorDB[itemSet['Body']];
        embedTitle = `${armoraliases[baseName.toLowerCase()]} Set (Unique Pieces)`;
    }
    else{
        itemDetails = armorDB[dbscripts.getFullName(itemSet['Body'], itemWeapon)];
        embedTitle = `${armoraliases[baseName.toLowerCase()]} Set (${itemWeapon})`;
    }
    itemStats += `\n**Total Set Stat: ${itemDetails['set_total'].replace('...', '')}**`;
    embedMessage = new Discord.MessageEmbed({
        title: embedTitle,
        url: `https://sinoalice.game-db.tw/setbonus/${setbonuses[armoraliases[baseName.toLowerCase()]]}`.replace(' ', '%20'),
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