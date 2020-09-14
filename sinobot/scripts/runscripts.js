var Discord = require('discord.js');
const {spawn} = require('child_process');
const path = require('path');
const armorsets = require('../database/armorsetsDB.json');
const fs = require('fs');

var updatingWeapons = false;
var updatingArmor = false;
var updatingNightmares = false;

function runScraperScript(type){
  return spawn('python', ["-u", path.join(__dirname, '../scraper/sinodbscraper.py'), "-t", type]);
};

function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else{
        aliasesFileData = JSON.parse(data);
        for (setName in armorsets){
            aliasesList = [setName.replace(' ', ''), setName.toLowerCase(), setName.replace('\'', ''), 
            setName.replace(' ', '').toLowerCase(), setName.replace(' ', '').replace('\'', ''), setName.toLowerCase().replace('\'', ''),
            setName.replace(' ', '').toLowerCase().replace('\'', '')]
            aliasesList.forEach(alias => {
                if (!(alias in aliasesFileData))
                    aliasesFileData[alias] = setName;
            })
        }
        json = JSON.stringify(aliasesFileData);
        fs.writeFile(path.join(__dirname, '../database/armoraliases.json'), json, 'utf8', function writeCallback(err){if (err) throw err;});
    }
}

function addArmorAliases(){
    fs.readFile(path.join(__dirname, '../database/armoraliases.json'), 'utf8', readFileCallback);
}

addArmorAliases();

function runWeaponsScript(message){
    if (updatingWeapons == true){
        message.channel.send("Weapons database is currently being updated.");
        return;
    }
    updatingWeapons = true;
    message.channel.send("Beginning weapons database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime. Updated database will not be used until restart.");
    child = runScraperScript('weapons');
    child.on('exit', function() {
        message.channel.send("Weapons database update is complete."); 
        updatingWeapons = false;
    });
};

function runArmorScript(message){
	if (updatingArmor == true){
        message.channel.send("Armor database is currently being updated.");
        return;
	}
    updatingArmor = true;
    message.channel.send("Beginning armor database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime. Updated database will not be available until restart.");
    child = runScraperScript('armor');
    child.on('exit', function() {
        message.channel.send("Armor database update is complete."); 
        updatingArmor = false;
    });
};

function runNightmaresScript(message){
	if (updatingNightmares == true){
        message.channel.send("Beginning nightmare database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime. Updated database will not be available until restart.");
        return;
	}
    updatingNightmares = true;
    message.channel.send("Beginning nightmares database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime. Updated database will not be available until restart.");
    child = runScraperScript('nightmares');
    child.on('exit', function() {
        message.channel.send("Nightmares database update is complete."); 
        updatingNightmares = false;
    });
};

module.exports.runUpdateScript = function(message, scriptType){
    if (scriptType == 'weapon' || scriptType == 'weapons')
        runWeaponsScript(message);
    else if (scriptType == 'armor')
        runArmorScript(message);
    else if (scriptType == 'nightmare' || args == 'nightmares')
        runNightmaresScript(message);
    else{
        console.log('There was an unrecognized argument');
        message.channel.send(`"${args}" not recognized`);
    }
};