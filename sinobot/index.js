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
                    item = weaponsaliases[fullArgument.replace(' ', '').toLowerCase()];
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
            // !armor [type] [itemName]    ex. !armor set replicant
            case 'armor':
                type = args[0];
                itemName = args.slice(1).join(' ');

                if (type == 'set'){
                    // If item is not in our current database, check if it is an alias. If not, return error
                    if (!(itemName in armorsetsDB)){
                        itemSet = armoraliases[itemName.replace(' ', '').toLowerCase()];
                        if (itemSet == null){
                            message.channel.send(`"${itemName}" was not found in the database.`);
                            return;
                        }
                    }
                    else
                        itemSet = armorsetsDB[itemName];
                    // Build Message to send

                }
                else if (['head', 'hands', 'feet', 'body'].includes(type.toLowerCase())){
                    // If item is not in our current database, check if it is an alias. If not, return error
                    if (!(itemName in armorDB)){
                        itemName = armoraliases[itemName.replace(' ', '').toLowerCase()];
                        if (itemName == null){
                            message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                            return;
                        }
                    }
                    itemDetails = armorDB[item];
                    // Build message to send
                    embeddedMessage = new Discord.MessageEmbed({
                    title: `${item} (${itemDetails['altName']})`,
                    url: `https://sinoalice.game-db.tw/armor/${itemDetails['altName']}`,
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
                }
                else {
                    message.channel.send(`"${type}" is an invalid option`);
                    return;
                }
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