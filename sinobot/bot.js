var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var weaponsDB = require('./database/weaponsDB.json');
const path = require('path')
const {spawn} = require('child_process')

var updatingWeapon = false;

function runScript(type){
  return spawn('python', [
    "-u", 
    path.join(__dirname, 'sinodbscraper.py'),
    "-t",
    type
    ]);
}

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
            case 'update':
                if (args[0] == 'weapon' || args[0] == 'weapons'){
                    if (updatingWeapon == true)
                        break;
                    updatingWeapon = true;
                    child = runScript('weapons');
                    child.on('exit', function() { updatingWeapon = false; });
                }
                else if (args[0] == 'armor'){
                    runScript('armor');
                }
                else if (args[0] == 'nightmare' || args[0] == 'nightmares'){
                    runScript('nightmares');
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
                bot.sendMessage({
                    to: channelID,
                    message: "Devola & Popola's Staff"
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