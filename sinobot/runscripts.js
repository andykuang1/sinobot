var Discord = require('discord.js');
const {spawn} = require('child_process');
const path = require('path');

var updatingWeapons = false;
var updatingArmor = false;
var updatingNightmares = false;

function runScript(type){
  return spawn('python', ["-u", path.join(__dirname, '/scraper/sinodbscraper.py'), "-t", type]);
};

module.exports.runWeaponsScript = function(message){
    if (updatingWeapons == true){
        message.channel.send("Weapons database is currently being updated.");
        return;
    }
    updatingWeapons = true;
    message.channel.send("Beginning weapons database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime.");
    child = runScript('weapons');
    child.on('exit', function() {
        message.channel.send("Weapons database update is complete."); 
        updatingWeapons = false;
    });
};

module.exports.runArmorScript = function(message){
	if (updatingArmor == true){
        message.channel.send("Armor database is currently being updated.");
        return;
	}
    updatingArmor = true;
    message.channel.send("Beginning armor database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime.");
    child = runScript('armor');
    child.on('exit', function() {
        message.channel.send("Armor database update is complete."); 
        updatingArmor = false;
    });
};

module.exports.runNightmaresScript = function(message){
	if (updatingNightmares == true){
        message.channel.send("Nightmare database is currently being updated.");
        return;
	}
    updatingNightmares = true;
    message.channel.send("Beginning nightmares database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime.");
    child = runScript('nightmares');
    child.on('exit', function() {
        message.channel.send("Nightmares database update is complete."); 
        updatingNightmares = false;
    });
};