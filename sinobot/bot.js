const runscripts = require('./runscripts.js');

var auth = require('./auth.json');
var aliases = require('./database/aliases.json');
var weaponsDB = require('./database/weaponsDB.json');
var armorDB = require('./database/armorDB.json');
var nightmaresDB = require('./database/nightmaresDB.json');

var Discord = require('discord.io');
var logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'commands':
                break;
            case 'update':
                if (args == 'weapon' || args == 'weapons')
                    runscripts.runWeaponsScript(bot, channelID);
                else if (args == 'armor')
                    runscripts.runArmorScript(bot, channelID);
                else if (args == 'nightmare' || args == 'nightmares')
                    runscripts.runNightmaresScript(bot, channelID);
                else{
                    logger.info('The argument is not recognized')
                    bot.sendMessage({
                        to: channelID,
                        message: `"${args}" not recognized`
                    });
                }
                break;
            case 'weapon':
            case 'weapons':
                item = args;
                // If item is not in our current database, check if it is an alias. If not, return error
                if (!(args in weaponsDB)){
                    item = aliases[args];
                    if (item == null){
                        bot.sendMessage({
                            to: channelID,
                            message: `"${args}" was not found in the database.`
                        });
                        return;
                    }
                }
                itemDetails = weaponsDB[item];
                // Build message to send
                messageToSend = `**${item}** (${itemDetails['altName']})`;
                messageToSend += `\n*https://sinoalice.game-db.tw/weapons/${itemDetails['altName']}*`
                bot.sendMessage({
                    to: channelID,
                    message: messageToSend
                });
                break;
            case 'armor':
                item = args;
                // If item is not in our current database, check if it is an alias. If not, return error
                if (!(args in armorDB)){
                    item = aliases[args];
                    if (item == null){
                        bot.sendMessage({
                            to: channelID,
                            message: `"${args}" was not found in the database.`
                        });
                        return;
                    }
                }
                itemDetails = armorDB[item];
                // Build message to send
                bot.sendMessage({
                    to: channelID,
                    message: `${item} (${itemDetails['altName']})`
                });
                break;
            case 'nightmare':
            case 'nightmares':
                item = args
                // If item is not in our current database, check if it is an alias. If not, return error
                if (!(args in nightmaresDB)){
                    item = aliases[args];
                    if (item == null){
                        bot.sendMessage({
                            to: channelID,
                            message: `"${args}" was not found in the database.`
                        });
                        return
                    }
                }
                itemDetails = nightmaresDB[item]
                // Build message to send
                bot.sendMessage({
                    to: channelID,
                    message: `${item} (${itemDetails['altName']}) ` 
                });
                break;
         }
     }
});