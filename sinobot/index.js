const runscripts = require('./runscripts.js');
const formatscripts = require('./formatscripts.js');

const config = require('./config.json');
const weaponsaliases = require('./database/weaponsaliases.json');
const armoraliases = require('./database/armoraliases.json');
const weaponsDB = require('./database/weaponsDB.json');
const armorDB = require('./database/armorDB.json');
const armorsetsDB = require('./database/armorsetsDB.json');
const nightmaresDB = require('./database/nightmaresDB.json');

const Discord = require('discord.js');

const skill_icons = {
    'story': 'https://sinoalice.game-db.tw/images/battle_icon01.png',
    'armor_story': 'https://sinoalice.game-db.tw/images/battle_icon02.png',
    'colo': 'https://sinoalice.game-db.tw/images/battle_icon01.png',
    'colo_support': 'https://sinoalice.game-db.tw/images/battle_icon04.png'
};

// Initialize Discord Bot
var client = new Discord.Client({autoreconnect: true});
client.login(config['token']);

client.once('ready', function () {
    console.log('Ready!');
});

function getItem(message, commandArgument, type){
    if (type == 'weapon'){
        fullArgument = commandArgument.join(' ')
        if (!(fullArgument in weaponsDB)){
            item = weaponsaliases[fullArgument];
            if (item == null){
                message.channel.send(`"${fullArgument}" was not found in the database.`);
                return -1;
            }
        }
        else
            item = fullArgument;
        return item;
    }
    else if (type == 'armor'){
        if (!(itemName in armorDB)){
            itemName = armoraliases[itemName];
            if (itemName == null){
                message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                return -1;
            }
    }
    }
};

function getArmorSet(baseName){
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

// takes in an arg such as "set hammer replicant" and returns [itemName, itemWeapon] ex. ['replicant', 'Heavy']
function parseArmorArgument(args){
    weaponTypes = ['instrument', 'tome', 'orb', 'staff', 'sword', 'hammer', 'ranged', 'spear'];
    weaponMatching = {'instrument': 'Instrument', 'tome': 'Tome', 'orb': 'Artifact', 'staff': 'Staff', 
    'sword': 'Blade', 'hammer': 'Heavy', 'ranged': 'Projectile', 'spear': 'Polearm'};
    if (['set', 'head', 'hands', 'feet', 'body'].includes(args[0].toLowerCase())){
        itemWeapon = args[1];
        // !armor [itemType] [itemWeapon] [itemName]    ex. !armor set hammer replicant
        if (weaponTypes.includes(itemWeapon.toLowerCase())){
            itemName = args.slice(2).join(' ');
            itemWeapon = weaponMatching[itemWeapon];
        }
        // no [itemWeapon] - !armor [itemType] [itemName]    ex. !armor set replicant
        else{
            itemName = args.slice(1).join(' ');
            itemWeapon = 'Blade';
        }

    }
    // no [itemType]
    else{
        itemWeapon = args[0];
        // !armor [itemWeapon] [itemName]    ex. !armor hammer replicant
        if (weaponTypes.includes(itemWeapon.toLowerCase())){
            itemName = args.slice(1).join(' ');
            itemWeapon = weaponMatching[itemWeapon];
        }
        // no [itemWeapon] - !armor [itemName]    ex. !armor replicant
        else{
            itemName = args.join(' ');
            itemWeapon = 'Blade';
        }
    }
    return [itemName, itemWeapon];
};

function createEmbedMessageItem(itemDetails, type){
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

function createEmbedMessageArmorSet(itemSet, itemName){
    baseName = itemName[0];
    itemWeapon = itemName[1];
    itemStats = ''
    for (item in itemSet){
        if ('unique' in itemSet)
            itemDetails = armorDB[itemSet[item]];
        else
            itemDetails = armorDB[formatscripts.getFullName(itemSet, item, itemWeapon)];
        itemStats += `[${itemSet[item]}](${itemDetails['icon']})`;
        itemStats += formatscripts.formatArmorStats(itemDetails);
    }
    itemDetails = armorDB[formatscripts.getFullName(itemSet, 'Body', 'Blade')];
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
}

client.on('message', function (message) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !commands
            case 'commands':
                break;
            // !update [type]    ex. !update weapons
            case 'update':
                console.log(message.content);
                runscripts.runUpdateScript(message, args);
                break;
            // !weapon [itemName]    ex. !weapon dpstaff
            case 'weapon':
            case 'weapons':
                console.log(message.content);
                // If item is not in our current database, check if it is an alias. If not, return error
                item = getItem(message, args, 'weapon');
                if (item == -1)
                    break;
                itemDetails = weaponsDB[item];
                // Build message to send
                embedMessage = createEmbedMessageItem(itemDetails, 'weapon');
                message.channel.send(embedMessage);
                break;
            // !armor [itemType:optional] [itemWeapon:defaults to 'sword'] [itemName]    ex. !armor set hammer replicant
            case 'armor':
                console.log(message.content);
                itemName = parseArmorArgument(args);
                itemType = args[0];
                if (itemType == 'set'){
                    setName = itemName[0];
                    // If item is not in our current database, check if it is an alias. If not, return error
                    itemSet = getArmorSet(setName);
                    if (itemSet == -1){
                        message.channel.send(`"${setName}" was not found in the database.`);
                        break;
                    }
                    // Build Item Stats (full set of items)
                    embedMessage = createEmbedMessageArmorSet(itemSet, itemName);
                    message.channel.send(embedMessage);
                }
                else if (['head', 'hands', 'feet', 'body'].includes(itemType.toLowerCase())){
                    // // If item is not in our current database, check if it is an alias. If not, return error
                    // if (!(itemName in armorDB)){
                    //     itemName = armoraliases[itemName];
                    //     if (itemName == null){
                    //         message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                    //         return;
                    //     }
                    // }
                    // itemDetails = armorDB[item];
                    // // Build message to send
                    // embedMessage = new Discord.MessageEmbed({
                    // title: `${item} (${itemDetails['altName']})`,
                    // url: decodeURI(`https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`),
                    // thumbnail: {url: itemDetails['icon']},
                    // fields: [
                    //     {
                    //         name: 'Stats',
                    //         value: formatscripts.formatArmorStats(itemDetails)
                    //     },
                    //     {
                    //         name: 'Skills',
                    //         value: formatscripts.formatSkills(itemDetails, 'armor')
                    //     }
                    // ]
                    // });
                    // message.channel.send(embedMessage);
                    // break;
                }
                else {
                    // if (!(itemName in armorDB)){
                    //     item = armoraliases[itemName];
                    //     if (item == null){
                    //         message.channel.send(`"${fullArgument}" was not found in the database.`);
                    //         return;
                    //     }
                    // }
                    // else
                    //     item = itemName;
                    // itemDetails = armorDB[item];
                    // // Build message to send
                    // embedMessage = new Discord.MessageEmbed({
                    //     title: `${item} (${itemDetails['altName']})`,
                    //     url: `https://sinoalice.game-db.tw/weapons/${itemDetails['altName']}`,
                    //     thumbnail: {url: itemDetails['icon']},
                    //     fields: [
                    //         {
                    //             name: 'Stats',
                    //             value: formatscripts.formatWeaponStats(itemDetails)
                    //         },
                    //         {
                    //             name: 'Skills',
                    //             value: formatscripts.formatSkills(itemDetails, 'weapon')
                    //         }
                    //     ]
                    // });
                    // message.channel.send(embedMessage);
                }
                break;
            case 'nightmare':
            case 'nightmares':
                console.log(message.content);
                item = args.join('').toLowerCase();
                // If item is not in our current database, check if it is an alias. If not, return error
                if (!(item in nightmaresDB)){
                    item = nightmarealiases[item];
                    if (item == null){
                        message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                        return;
                    }
                }
                itemDetails = nightmaresDB[item]
                // Build message to send
                message.channel.send(`${item} (${itemDetails['altName']}) `);
                break;
         }
     }
});