const runscripts = require('./runscripts.js');
const formatscripts = require('./formatscripts.js');

const config = require('./config.json');
const weaponaliases = require('./database/weaponaliases.json');
const weaponsDB = require('./database/weaponsDB.json');
const armorDB = require('./database/armorDB.json');
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
            // !ping
            case 'commands':
                break;
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
            case 'weapon':
            case 'weapons':
                // If item is not in our current database, check if it is an alias. If not, return error
                fullArgument = args.join(' ')
                if (!(fullArgument in weaponsDB)){
                    item = weaponaliases[fullArgument.replace(' ', '').toLowerCase()];
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
            case 'armor':
                item = args.join('').toLowerCase();
                // If item is not in our current database, check if it is an alias. If not, return error
                if (!(item in armorDB)){
                    item = armoraliases[item];
                    if (item == null){
                        message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                        return;
                    }
                }
                itemDetails = armorDB[item];
                // Build message to send
                message.channel.send(`${item} (${itemDetails['altName']})`);
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