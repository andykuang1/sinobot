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

async function sendNotFoundMessage(message, nameToPrint, typeOfItem){
    notFoundString = `**${nameToPrint}** was not found in the database. `
    fuzzyMatchedItems = await dbscripts.getFuzzyItem(nameToPrint, typeOfItem);
    if (fuzzyMatchedItems == -1){
        notFoundString += 'No close matches were found.';
        message.channel.send(notFoundString);
        return;
    } else {
        notFoundString += 'Possible matches (Case Insensitive):\n'
        fuzzyMatchedItems.forEach(name => {
            notFoundString += `\n**${name}**`;
        });
        message.channel.send(notFoundString);
        return;
    }
}

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
                async function processWeaponCommand(){
                    item = await dbscripts.getItem(args.join(' '), 'weapons');
                    // Fuzzy matched response
                    if (item == -1){
                        sendNotFoundMessage(message, args.join(' '), 'weapons');
                        return;
                    }
                    // Build message to send
                    embedMessage = createembedscripts.createEmbedMessageItem(item, 'weapons');
                    message.channel.send(embedMessage);
                }
                processWeaponCommand();
                break;
            // !armor [itemType:optional] [itemWeapon:defaults to 'Blade'] [baseName]    ex. !armor set hammer replicant
            case 'armor':
            case 'a':
                console.log(message.content);
                async function processArmorCommand(){
                    itemType = args[0];
                    parsedArgument = await formatscripts.parseArmorArgument(args);
                    baseName = parsedArgument[0];
                    if (baseName == -1){
                        message.channel.send(`"${parsedArgument[1]} Set" does not contain the given weapon type.`);
                        return;
                    }
                    armorWeaponType = parsedArgument[1];
                    itemSet = await dbscripts.getArmorSet(baseName);
                    if (itemType.toLowerCase() == 'set'){
                        // If item is not in our current database, check if it is an alias. If not, return error
                        if (itemSet == -1){
                            sendNotFoundMessage(message, baseName, 'armorsets');
                            return;
                        }
                        // Send embed message
                        embedMessage = await createembedscripts.createEmbedMessageArmorSet(itemSet, parsedArgument);
                        message.channel.send(embedMessage);
                    }
                    else if (['head', 'hands', 'feet', 'body'].includes(itemType.toLowerCase())){
                        // If item is not in our current database, check if it is an alias. If not, return error
                        if (itemSet == -1){
                            sendNotFoundMessage(message, baseName, 'armorsets');
                            return;
                        }
                        individualItemName = itemSet[formatscripts.capitalize(itemType)];
                        itemFullName = await dbscripts.getFullName(individualItemName, armorWeaponType);
                        item = await dbscripts.getItem(itemFullName, 'armor');
                        // Send embed message
                        embedMessage = createembedscripts.createEmbedMessageItem(item, 'armor');
                        message.channel.send(embedMessage);

                    }
                    else {
                        // If itemset is not in our current database, check if it is an individual item. If not, return error
                        if (itemSet == -1){
                            itemFullName = await dbscripts.getFullName(baseName, armorWeaponType);
                            if (itemFullName == -1){
                                sendNotFoundMessage(message, baseName, 'armor');
                                return;
                            }
                            item = await dbscripts.getItem(itemFullName, 'armor');
                            if (item == -1){
                                sendNotFoundMessage(message, baseName, 'armor');
                                return;
                            }
                            // Build Message To Send
                            embedMessage = createembedscripts.createEmbedMessageItem(item, 'armor');
                            message.channel.send(embedMessage);
                            return;
                        }
                        // Build message to send for itemset
                        embedMessage = await createembedscripts.createEmbedMessageArmorSet(itemSet, parsedArgument);
                        message.channel.send(embedMessage);
                        return;
                    }
                }
                processArmorCommand();
                break;
            case 'nightmare':
            case 'nightmares':
            case 'n':
                console.log(message.content);
                // If item is not in our current database, check if it is an alias. If not, return error
                async function processNightmareCommand(){
                    item = await dbscripts.getItem(args.join(' '), 'nightmares');
                    // Fuzzy matched response
                    if (item == -1){
                        sendNotFoundMessage(message, args.join(' '), 'nightmares');
                        return;
                    }
                    // Build message to send
                    embedMessage = createembedscripts.createEmbedMessageItem(item, 'nightmares');
                    message.channel.send(embedMessage);
                }
                processNightmareCommand();
                break;
         }
     }
});