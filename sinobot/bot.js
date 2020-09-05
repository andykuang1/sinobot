const runscripts = require('./runscripts.js');

var auth = require('./auth.json');
var aliases = require('./database/aliases.json');
var weaponsDB = require('./database/weaponsDB.json');

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
                if (args == 'weapon' || args == 'weapons'){
                    runscripts.runWeaponsScript(bot, channelID);
                }
                else if (args == 'armor'){
                    runscripts.runArmorScript(bot, channelID);
                }
                else if (args == 'nightmare' || args == 'nightmares'){
                    runscripts.runNightmareScript(bot, channelID);
                }
                else{
                    logger.info('The argument is not recognized')
                    bot.sendMessage({
                        to: channelID,
                        message: "The argument was not recognized"
                    })
                }
                break;
            case 'weapon':
            case 'weapons':
                item = aliases[args]
                itemDetails = weaponsDB[item]
                bot.sendMessage({
                    to: channelID,
                    message: `${item} (${itemDetails['altName']})`
                });
                break;
            case 'armor':
                break;
            case 'nightmare':
                break;
            case 'nightmares':
                break;
         }
     }
});