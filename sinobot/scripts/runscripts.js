var Discord = require('discord.js');
const {spawn} = require('child_process');
const path = require('path');
const armorsets = require('../database/armorsets.json');
const dbscripts = require('./dbscripts.js');

var updatingWeapons = false;
var updatingArmor = false;
var updatingNightmares = false;

function runScraperScript(type){
  return spawn('python', ["-u", path.join(__dirname, '../scraper/sinodbscraper.py'), "-t", type]);
};

async function addArmorAliases(){
    data = await dbscripts.get_armorsets_aliases();
    currentAliases = [];
    data.forEach(row => {currentAliases.push(row.alias);})
    for (setName in armorsets){
        aliasesList = new Set();
        [setName, setName.replace(' ', ''), setName.replace('\'', ''), setName.replace(' ', '').replace('\'', '')].forEach(item => aliasesList.add(item));
        aliasesList.forEach(async function(alias){
            if (!(currentAliases.includes(alias))){
                await dbscripts.add_alias(alias, setName);
            }
        })
    }
}
addArmorAliases();

function runWeaponsScript(message){
    if (updatingWeapons == true){
        message.channel.send("Weapons database is already being updated.");
        return;
    }
    updatingWeapons = true;
    message.channel.send("Beginning weapons database update, which can take up to 5 minutes. Please feel free to continue using the old database in the meantime, as the updated database will not be used until restart.");
    child = runScraperScript('weapons');
    child.on('exit', function() {
        message.channel.send("Weapons database update is complete."); 
        updatingWeapons = false;
    });
};

function runArmorScript(message){
	if (updatingArmor == true){
        message.channel.send("Armor database is already being updated.");
        return;
	}
    updatingArmor = true;
    message.channel.send("Beginning armor database update, which can take up to 5 minutes. Please feel free to continue using the old database in the meantime, as the updated database will not be available until restart.");
    child = runScraperScript('armor');
    child.on('exit', function() {
        message.channel.send("Armor database update is complete."); 
        updatingArmor = false;
    });
};

function runNightmaresScript(message){
	if (updatingNightmares == true){
        message.channel.send("Nightmares database is already being updated.");
        return;
	}
    updatingNightmares = true;
    message.channel.send("Beginning nightmares database update. This can take up to 5 minutes. Please feel free to continue using the old database in the meantime, as the updated database will not be available until restart.");
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
    else if (scriptType == 'nightmare' || scriptType == 'nightmares')
        runNightmaresScript(message);
    else{
        console.log('There was an unrecognized argument');
        message.channel.send(`"${args}" not recognized`);
    }
};