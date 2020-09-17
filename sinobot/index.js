const runscripts = require('./scripts/runscripts.js');
const formatscripts = require('./scripts/formatscripts.js');
const createembedscripts = require('./scripts/createembedscripts.js');
const dbscripts = require('./scripts/dbscripts.js');

const config = require('./config.json');
const weaponsDB = require('./database/weaponsDB.json');

const Discord = require('discord.js');

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
                console.log(message.content);
                runscripts.runUpdateScript(message, args);
                break;
            // !weapon [itemName]    ex. !weapon dpstaff
            case 'weapon':
            case 'weapons':
                console.log(message.content);
                // If item is not in our current database, check if it is an alias. If not, return error
                item = dbscripts.getItem(args, 'weapon');
                if (item == -1){
                    message.channel.send(`${args.join(' ')} was not found in the database.`);
                    break;
                }
                // Build message to send
                embedMessage = createembedscripts.createEmbedMessageItem(item, 'weapon');
                message.channel.send(embedMessage);
                break;
            // !armor [itemType:optional] [itemWeapon:defaults to 'sword'] [itemName]    ex. !armor set hammer replicant
            case 'armor':
                console.log(message.content);
                itemName = formatscripts.parseArmorArgument(args);
                itemType = args[0];
                if (itemType.toLowerCase() == 'set'){
                    setName = itemName[0];
                    // If item is not in our current database, check if it is an alias. If not, return error
                    itemSet = dbscripts.getArmorSet(setName);
                    if (itemSet == -1){
                        message.channel.send(`"${setName}" was not found in the database.`);
                        break;
                    }
                    // Build Item Stats (full set of items)
                    embedMessage = createembedscripts.createEmbedMessageArmorSet(itemSet, itemName);
                    message.channel.send(embedMessage);
                }
                else if (['head', 'hands', 'feet', 'body'].includes(itemType.toLowerCase())){
                    // // If item is not in our current database, check if it is an alias. If not, return error
                    // itemFullName = dbscripts.getFullName(itemName[0], itemName[1])
                    // if (itemFullName = -1){
                    //     message.channel.send(`${itemName[0]} was not found in the database`);
                    //     break;
                    // }
                    // item = dbscripts.getItem(itemFullName, 'armor');
                    // if (item == -1){
                    //     message.channel.send(`${itemName[0]} was not found in the database.`);
                    //     break;
                    // }
                    // // Build message to send
                    // embedMessage = createembedscripts.createEmbedMessageItem(item, 'armor');
                    // message.channel.send(embedMessage);
                    // break;
                }
                else {
                    itemFullName = dbscripts.getFullName(itemName[0], itemName[1]);
                    if (itemFullName == -1){
                        message.channel.send(`${itemName[0]} was not found in the database.`);
                        break;
                    }
                    // If item is not in our current database, check if it is an alias. If not, return error
                    item = dbscripts.getItem(itemFullName, 'armor');
                    if (item == -1){
                        message.channel.send(`${itemName} was not found in the database.`);
                        break;
                    }
                    // Build message to send
                    embedMessage = createembedscripts.createEmbedMessageItem(item, 'armor');
                    message.channel.send(embedMessage);
                    break;
                }
                break;
            case 'nightmare':
            case 'nightmares':
                // item = args.join('').toLowerCase();
                // // If item is not in our current database, check if it is an alias. If not, return error
                // if (!(item in nightmaresDB)){
                //     item = nightmarealiases[item];
                //     if (item == null){
                //         message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                //         return;
                //     }
                // }
                // itemDetails = nightmaresDB[item]
                // // Build message to send
                // message.channel.send(`${item} (${itemDetails['altName']}) `);
                // break;
         }
     }
});