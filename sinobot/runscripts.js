var Discord = require('discord.io');
const {spawn} = require('child_process');
const path = require('path');

var updatingWeapons = false;
var updatingArmor = false;
var updatingNightmares = false;

function runScript(type){
  return spawn('python', ["-u", path.join(__dirname, '/scraper/sinodbscraper.py'), "-t", type]);
};

module.exports.runWeaponsScript = function(bot, channelID){
    if (updatingWeapons == true){
        bot.sendMessage({
            to: channelID,
            message: "Weapons database is currently being updated."
            });
        return;
    }
    updatingWeapons = true;
    bot.sendMessage({
        to: channelID,
        message: "Beginning weapons database update. This can take up to 5 minutes. Please feel free to use the old database in the meantime."
    });
    child = runScript('weapons');
    child.on('exit', function() {
        bot.sendMessage({
            to: channelID,
            message: "Weapons database update is complete."
        }); 
        updatingWeapons = false;
    });
};

module.exports.runArmorScript = function(bot, channelID){
	if (updatingArmor == true){
        bot.sendMessage({
            to: channelID,
            message: "Armor database is currently being updated."
            });
        return;
	}
    updatingArmor = true;
    bot.sendMessage({
        to: channelID,
        message: "Beginning armor database update. This can take up to 5 minutes. Please feel free to use the old database in the meantime."
    });
    child = runScript('armor');
    child.on('exit', function() {
        bot.sendMessage({
            to: channelID,
            message: "Armor database update is complete."
        }); 
        updatingArmor = false;
    });
};

module.exports.runNightmaresScript = function(bot, channelID){
	if (updatingNightmares == true){
        bot.sendMessage({
            to: channelID,
            message: "Nightmare database is currently being updated."
            });
        return;
	}
    updatingNightmares = true;
    bot.sendMessage({
        to: channelID,
        message: "Beginning nightmares database update. This can take up to 5 minutes. Please feel free to use the old database in the meantime."
    });
    child = runScript('nightmares');
    child.on('exit', function() {
        bot.sendMessage({
            to: channelID,
            message: "Nightmares database update is complete."
        }); 
        updatingNightmares = false;
    });
};