const runscripts = require('./runscripts.js');

const config = require('./config.json');
const aliases = require('./database/aliases.json');
const weaponsDB = require('./database/weaponsDB.json');
const armorDB = require('./database/armorDB.json');
const nightmaresDB = require('./database/nightmaresDB.json');

const Discord = require('discord.js');

const skill_icons = {
    'story': 'https://sinoalice.game-db.tw/images/battle_icon01.png',
    'armor_story': 'https://sinoalice.game-db.tw/images/battle_icon02.png',
    'colo': 'https://sinoalice.game-db.tw/images/battle_icon01.png',
    'colo_support': 'https://sinoalice.game-db.tw/images/battle_icon04.png'
};

whitespace_regex = /\s+/g;

//takes and returns a string
function formatSpacing(number){
    return (number < 1000) ? ' ' + number : number;
}

function formatStats(itemDetails){
    pdps = ['Hammer', 'Sword', 'Instrument', 'Tome'];
    mdps = ['Orb', 'Spear', 'Ranged', 'Instrument', 'Tome'];
    // Shared details first
    formattedString = `\`\`\`PATK: ${formatSpacing(itemDetails['patk'])}\tMATK: ${formatSpacing(itemDetails['matk'])}\
            \nPDEF: ${formatSpacing(itemDetails['pdef'])}\tMDEF: ${formatSpacing(itemDetails['mdef'])}`;
    // Total ATK only for supports
    if (itemDetails['type'] in ['Instrument', 'Tome']){
        formattedString += `\nTotal ATK: ${formatSpacing(itemDetails['total_atk'])}`;
    }
    // Shared detail again
    formattedString += `\n\nTotal DEF: ${formatSpacing(itemDetails['total_def'])}`;
    if (itemDetails['type'] in pdps){
        formattedString += `\nTotal PDPS Stat: ${formatSpacing(itemDetails['pdps'])}`;
    }
    else
        formattedString = formattedString;
    formattedString += `\nTotal Stat: ${itemDetails['total_stat'].replace(whitespace_regex, '')}\`\`\``;
    return formattedString;
};

function formatSkills(itemDetails, type){
    if (type == 'weapon'){
        formattedString = `**${itemDetails['story_skill'].split('\n')[0]}**: ${itemDetails['story_skill'].split('\n')[1].replace('')}\
            \n\n**${itemDetails['colo_skill'].split('\n')[0]}**: ${itemDetails['colo_skill'].split('\n')[1]}\
            \n\n**${itemDetails['colo_support'].split('\n')[0]}**: ${itemDetails['colo_support'].split('\n')[1]}`
    }
    return formattedString;
};

// Initialize Discord Bot
var client = new Discord.Client({autoreconnect: true});
client.login(config['token']);

client.once('ready', function () {
    console.log('Ready!');
});

client.on('message', function (message) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'commands':
                break;
            case 'update':
                if (args == 'weapon' || args == 'weapons')
                    runscripts.runWeaponsScript(message);
                else if (args == 'armor')
                    runscripts.runArmorScript(message);
                else if (args == 'nightmare' || args == 'nightmares')
                    runscripts.runNightmaresScript(message);
                else{
                    console.log('There was an unrecognized argument');
                    message.channel.send(`"${args}" not recognized`);
                }
                break;
            case 'weapon':
            case 'weapons':
                // If item is not in our current database, check if it is an alias. If not, return error
                fullArgument = args.join(' ')
                if (!(fullArgument in weaponsDB)){
                    item = aliases[fullArgument.replace(' ', '').toLowerCase()];
                    if (item == null){
                        message.channel.send(`"${fullArgument}" was not found in the database.`);
                        return;
                    }
                }
                else
                    item = fullArgument;
                itemDetails = weaponsDB[item];
                // Build message to send
                embeddedMessage = new Discord.MessageEmbed({
                    title: `${item} (${itemDetails['altName']})`,
                    url: `https://sinoalice.game-db.tw/weapons/${itemDetails['altName']}`,
                    thumbnail: {url: itemDetails['icon']},
                    fields: [
                        {
                            name: 'Stats',
                            value: formatStats(itemDetails)
                        },
                        {
                            name: 'Skills',
                            value: formatSkills(itemDetails, 'weapon')
                        }
                    ]
                });
                message.channel.send(embeddedMessage);
                break;
            case 'armor':
                item = args.join('').toLowerCase();
                // If item is not in our current database, check if it is an alias. If not, return error
                if (!(item in armorDB)){
                    item = aliases[item];
                    if (item == null){
                        message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                        return;
                    }
                }
                itemDetails = armorDB[item];
                // Build message to send
                message.channel.send(`${item} (${itemDetails['altName']})`);
                break;
            case 'nightmare':
            case 'nightmares':
                item = args.join('').toLowerCase();
                // If item is not in our current database, check if it is an alias. If not, return error
                if (!(item in nightmaresDB)){
                    item = aliases[item];
                    if (item == null){
                        message.channel.send(`"${args.join(' ')}" was not found in the database.`);
                        return;
                    }
                }
                itemDetails = nightmaresDB[item]
                // Build message to send
                message.channel.send(`${item} (${itemDetails['altName']}) `);
                break;
         }
     }
});