const dbscripts = require('./dbscripts.js');
const formatscripts = require('./formatscripts.js');

const setbonuses = require('../database/setbonuses.json');

const Discord = require('discord.js');

module.exports.createEmbedMessageListItems = function(items, type, currentPage, totalPages){
    listItems = formatscripts.formatListItems(items, type);
    embedMessage = new Discord.MessageEmbed({
        fields: [{
            name: 'Filtered Items',
            value: listItems
        }],
        footer: {
            text: `Page ${currentPage} of ${totalPages}`
        }
    });
    return embedMessage;
}

module.exports.createEmbedMessageItem = function(item, type){
    itemTitle = `${item.itemName} \n${item.altName}`;
    itemThumbnail = {url: item.icon};
    if (type == 'weapons'){
        itemUrl = `https://sinoalice.game-db.tw/weapons/${item.altName.replace(' ', '%20')}`;
        statsValue = formatscripts.formatWeaponStats(item);
        skillsValue = formatscripts.formatSkills(item, 'weapon');
    }
    else if (type == 'armor'){
        itemUrl = `https://sinoalice.game-db.tw/armor/${item.altName.replace(' ', '%20')}`;
        statsValue = formatscripts.formatArmorStats(item);
        skillsValue = formatscripts.formatSkills(item, 'armor');
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

module.exports.createEmbedMessageArmorSet = async function(itemSet, setName){
    baseName = setName[0];
    itemWeapon = setName[1];
    itemStats = ''
    // Build up all the individual items
    for (item in itemSet){
        if ((item != 'unique') && (item != 'special')){
            if ('unique' in itemSet){
                itemDetails = await dbscripts.getItem(itemSet[item], 'armor');
                individualPieceName = itemSet[item];
            }
            else{
                fullItemName = await dbscripts.getFullName(itemSet[item], itemWeapon);
                itemDetails = await dbscripts.getItem(fullItemName, 'armor');
                individualPieceName = await dbscripts.getFullName(itemSet[item], itemWeapon);
            }
            if (!itemDetails)
                console.log(`${baseName} is missing weapon type ${itemWeapon} in createEmbedMessageArmorSet`)
            itemStats += `[${individualPieceName}](https://sinoalice.game-db.tw/armor/${itemDetails.altName.replace(' ', '%20')})`;
            itemStats += formatscripts.formatArmorStats(itemDetails);
        }
    }
    // Setup for set details
    if ('unique' in itemSet){
        itemDetails = await dbscripts.getItem(itemSet['Body'], 'armor');
        originalName = await dbscripts.getOriginalName(baseName, 'armorsets');
        embedTitle = `${originalName} Set (Unique Pieces)`;
    }
    else{
        itemFullName = await dbscripts.getFullName(itemSet['Body'], itemWeapon)
        itemDetails = await dbscripts.getItem(itemFullName, 'armor');
        originalName = await dbscripts.getOriginalName(baseName, 'armorsets');
        embedTitle = `${originalName} Set (${itemWeapon})`;
    }
    itemStats += `\n**Total Set Stat: ${itemDetails['set_total'].replace('...', '')}**`;
    originalName = await dbscripts.getOriginalName(baseName, 'armor');
    embedMessage = new Discord.MessageEmbed({
        title: embedTitle,
        url: `https://sinoalice.game-db.tw/setbonus/${setbonuses[originalName]}`.replace(' ', '%20'),
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
    console.log(itemStats);
    return embedMessage;
};