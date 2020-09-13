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

function getFullName(itemSet, item, itemWeapon){
    fullItemNameParens = `${itemSet[item]} (${formatscripts.capitalize(itemWeapon)})`;
    fullItemNameBrackets = `${itemSet[item]} [${formatscripts.capitalize(itemWeapon)}]`;
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
                if (args == 'weapon' || args == 'weapons')
                    runscripts.runWeaponsScript(message);
                else if (args == 'armor')
                    runscripts.runArmorScript(message);
                else if (args == 'nightmare' || args == 'nightmares')
                    runscripts.runNightmaresScript(message);
                else{
                    console.log('There was an unrecognized argument');
                    message.channel.send(`"${args}" not recognized`);
                }
                break;
            // !weapon [itemName]    ex. !weapon dpstaff
            case 'weapon':
            case 'weapons':
                // If item is not in our current database, check if it is an alias. If not, return error
                fullArgument = args.join(' ')
                if (!(fullArgument in weaponsDB)){
                    item = weaponsaliases[fullArgument];
                    if (item == null){
                        message.channel.send(`"${fullArgument}" was not found in the database.`);
                        return;
                    }
                }
                else
                    item = fullArgument;
                itemDetails = weaponsDB[item];
                // Build message to send
                embeddedMessage = new Discord.MessageEmbed({
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
                message.channel.send(embeddedMessage);
                break;
            // !armor [itemType:optional] [itemWeapon:defaults to 'sword'] [itemName]    ex. !armor set hammer replicant
            case 'armor':
                weaponTypes = ['instrument', 'tome', 'orb', 'staff', 'sword', 'hammer', 'ranged', 'spear'];
                itemType = args[0];
                // has [itemType]
                if (['set', 'head', 'hands', 'feet', 'body'].includes(itemType.toLowerCase())){
                    itemWeapon = args[1];
                    // !armor [itemType] [itemWeapon] [itemName]    ex. !armor set hammer replicant
                    if (weaponTypes.includes(itemWeapon.toLowerCase()))
                        itemName = args.slice(2).join(' ');
                    // no [itemWeapon] - !armor [itemType] [itemName]    ex. !armor set replicant
                    else{
                        itemWeapon = 'Blade';
                        itemName = args.slice(1).join(' ');
                    }

                }
                // no [itemType]
                else{
                    itemWeapon = args[0];
                    // !armor [itemWeapon] [itemName]    ex. !armor hammer replicant
                    if (weaponTypes.includes(itemWeapon.toLowerCase()))
                        itemName = args.slice(1).join(' ');
                    // no [itemWeapon] - !armor [itemName]    ex. !armor replicant
                    else{
                        itemWeapon = 'Blade';
                        itemName = args.join(' ');
                    }
                }

                if (itemType == 'set'){
                    // If item is not in our current database, check if it is an alias. If not, return error
                    if (!(itemName in armorsetsDB)){
                        itemSet = armorsetsDB[armoraliases[itemName]];
                        if (itemSet == null){
                            message.channel.send(`"${itemName}" was not found in the database.`);
                            return;
                        }
                    }
                    else
                        itemSet = armorsetsDB[itemName];
                    // Build Item Stats (full set of items)
                    itemStats = ''
                    for (item in itemSet){
                        if ('unique' in itemSet)
                            itemDetails = armorDB[itemSet[item]];
                        else
                            itemDetails = armorDB[getFullName(itemSet, item, itemWeapon)];
                        itemStats += `[${itemSet[item]}](${itemDetails['icon']})`;
                        itemStats += formatscripts.formatArmorStats(itemDetails);
                    }
                    itemDetails = armorDB[getFullName(itemSet, 'Body', 'Blade')];
                    itemStats += `\n**Total Set Stat: ${itemDetails['set_total'].replace('...', '')}**`;
                    armorUrl = `https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`;
                    console.log(armorUrl);
                    embeddedMessage = new Discord.MessageEmbed({
                        title: `${armoraliases[itemName]} Set`,
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
                    message.channel.send(embeddedMessage);
                }
                else if (['head', 'hands', 'feet', 'body'].includes(itemType.toLowerCase())){
                    // If item is not in our current database, check if it is an alias. If not, return error
                    if (!(itemName in armorDB)){
                        itemName = armoraliases[itemName];
                        if (itemName == null){
                            message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                            return;
                        }
                    }
                    itemDetails = armorDB[item];
                    // Build message to send
                    embeddedMessage = new Discord.MessageEmbed({
                    title: `${item} (${itemDetails['altName']})`,
                    url: decodeURI(`https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`),
                    thumbnail: {url: itemDetails['icon']},
                    fields: [
                        {
                            name: 'Stats',
                            value: formatscripts.formatArmorStats(itemDetails)
                        },
                        {
                            name: 'Skills',
                            value: formatscripts.formatSkills(itemDetails, 'armor')
                        }
                    ]
                    });
                    message.channel.send(embeddedMessage);
                    break;
                }
                else {
                    message.channel.send(`"${itemType}" is an invalid option`);
                    return;
                }
                break;
            case 'nightmare':
            case 'nightmares':
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