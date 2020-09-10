var Discord = require('discord.js');
const {spawn} = require('child_process');
const path = require('path');
const armorsets = require('./database/armorsetsDB.json');
const fs = require('fs');

var updatingWeapons = false;
var updatingArmor = false;
var updatingNightmares = false;

function runScraperScript(type){
  return spawn('python', ["-u", path.join(__dirname, '/scraper/sinodbscraper.py'), "-t", type]);
};

function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else{
        aliases = JSON.parse(data);
        for (item in armorsets){
            mergedLowercase = item.replace(' ', '').toLowerCase()
            if (!(mergedLowercase in aliases))
                aliases[mergedLowercase] = item;
            noApostrophes = mergedLowercase.replace('\'', '');
            if (!(noApostrophes in aliases))
                aliases[noApostrophes] = item;
        }
        json = JSON.stringify(aliases);
        fs.writeFile('./database/armoraliases.json', json, 'utf8', function writeCallback(err){if (err) throw err;});
    }
}

function addArmorAliases(){
    fs.readFile('./database/armoraliases.json', 'utf8', readFileCallback);
}

addArmorAliases();

module.exports.runWeaponsScript = function(message){
    if (updatingWeapons == true){
        message.channel.send("Weapons database is currently being updated.");
        return;
    }
    updatingWeapons = true;
    message.channel.send("Beginning weapons database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime.");
    child = runScraperScript('weapons');
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
    child = runScraperScript('armor');
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
    child = runScraperScript('nightmares');
    child.on('exit', function() {
        message.channel.send("Nightmares database update is complete."); 
        updatingNightmares = false;
    });
};