const runscripts = require('./scripts/runscripts.js');
const formatscripts = require('./scripts/formatscripts.js');
const createembedscripts = require('./scripts/createembedscripts.js');
const dbscripts = require('./scripts/dbscripts.js');

const config = require('./config.json');

const Discord = require('discord.js');

// Initialize Discord Bot
var client = new Discord.Client({autoreconnect: true});
client.login(config['token']);

client.once('ready', function () {
    console.log('Client is ready!');
});

client.on('message', function (message) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!!`
    if (message.content.substring(0, 2) == "!!") {
        var args = message.content.substring(2).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !commands
            case 'commands':
            case 'help':
                console.log(message.content);
                message.channel.send('Available Commands: \n**!!help**, \n**!!weapons**, \n**!!armor**, \n**!!nightmares**')

                break;
            // !update [type]    ex. !update weapons
            case 'update':
                console.log(message.content);
                runscripts.runUpdateScript(message, args);
                break;
            // !weapon [itemName]    ex. !weapon dpstaff
            case 'weapon':
            case 'weapons':
            case 'w':
                console.log(message.content);
                // If item is not in our current database, check if it is an alias. If not, return error
                async function processWeaponCommand(args){
                    item = await dbscripts.getItem(args.join(' '), 'weapons');
                    console.log(item);
                    if (item.length === 0){
                        message.channel.send(`${args.join(' ')} was not found in the database.`);
                        return;
                    }
                    // Build message to send
                    embedMessage = createembedscripts.createEmbedMessageItem(item[0], 'weapons');
                    message.channel.send(embedMessage);
                }
                processWeaponCommand(args);
                break;
            // !armor [itemType:optional] [itemWeapon:defaults to 'Blade'] [baseName]    ex. !armor set hammer replicant
            case 'armor':
            case 'a':
                console.log(message.content);
                itemType = args[0];
                parsedArgument = formatscripts.parseArmorArgument(args);
                baseName = parsedArgument[0];
                if (baseName == -1){
                    message.channel.send(`${parsedArgument[1]} Set does not contain the given weapon type.`)
                    break;
                }
                armorWeaponType = parsedArgument[1];
                itemSet = dbscripts.getArmorSet(baseName);
                if (itemType.toLowerCase() == 'set'){
                    // If item is not in our current database, check if it is an alias. If not, return error
                    if (itemSet == -1){
                        message.channel.send(`"${baseName}" was not found in the database.`);
                        break;
                    }
                    // Send embed message
                    embedMessage = createembedscripts.createEmbedMessageArmorSet(itemSet, parsedArgument);
                    message.channel.send(embedMessage);
                }
                else if (['head', 'hands', 'feet', 'body'].includes(itemType.toLowerCase())){
                    // If item is not in our current database, check if it is an alias. If not, return error
                    if (itemSet == -1){
                        message.channel.send(`"${baseName}" was not found in the database.`);
                        break;
                    }
                    individualItemName = itemSet[formatscripts.capitalize(itemType)];
                    itemFullName = dbscripts.getFullName(individualItemName, armorWeaponType);
                    item = dbscripts.getItem(itemFullName, 'armor');
                    // Send embed message
                    embedMessage = createembedscripts.createEmbedMessageItem(item, 'armor');
                    message.channel.send(embedMessage);

                }
                else {
                    // If itemset is not in our current database, check if it is an individual item. If not, return error
                    if (itemSet == -1){
                        itemFullName = dbscripts.getFullName(baseName, armorWeaponType);
                        if (itemFullName == -1){
                            message.channel.send(`${baseName} was not found in the database.`);
                            break;
                        }
                        item = dbscripts.getItem(itemFullName, 'armor');
                        if (item == -1){
                            message.channel.send(`${baseName} was not found in the database.`);
                            break;
                        }
                        // Build Message To Send
                        embedMessage = createembedscripts.createEmbedMessageItem(item, 'armor');
                        message.channel.send(embedMessage);
                        break;
                    }
                    // Build message to send for itemset
                    embedMessage = createembedscripts.createEmbedMessageArmorSet(itemSet, parsedArgument);
                    message.channel.send(embedMessage);
                    break;
                }
                break;
            case 'nightmare':
            case 'nightmares':
            case 'n':
                console.log(message.content);
                // If item is not in our current database, check if it is an alias. If not, return error
                async function processNightmareCommand(args){
                    item = await dbscripts.getItem(args.join(' '), 'weapons');
                    console.log(item);
                    if (item.length === 0){
                        message.channel.send(`${args.join(' ')} was not found in the database.`);
                        return;
                    }
                    // Build message to send
                    embedMessage = createembedscripts.createEmbedMessageItem(item[0], 'nightmares');
                    message.channel.send(embedMessage);
                }
                processWeaponCommand(args);
                break;
         }
     }
});