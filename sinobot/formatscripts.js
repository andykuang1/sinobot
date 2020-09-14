const armorDB = require('./database/armorDB.json');

whitespace_regex = /\s+/g;

//takes and returns a string
function formatSpacing(number){
    return (number < 1000) ? ' ' + number : number;
}

module.exports.formatWeaponStats = function(itemDetails){
    pdps = ['Hammer', 'Sword', 'Instrument', 'Tome'];
    mdps = ['Orb', 'Spear', 'Ranged', 'Instrument', 'Tome'];
    // Shared details first
    formattedString = `\`\`\`PATK: ${formatSpacing(itemDetails['patk'])}\tMATK: ${formatSpacing(itemDetails['matk'])}\
            \nPDEF: ${formatSpacing(itemDetails['pdef'])}\tMDEF: ${formatSpacing(itemDetails['mdef'])}`;
    // Total ATK only for supports
    if (['Instrument', 'Tome'].includes(itemDetails['type'])){
        formattedString += `\n\nTotal ATK: ${formatSpacing(itemDetails['total_atk'])}\
        \nTotal DEF: ${formatSpacing(itemDetails['total_def'])}`;
    }
    else{
        // Shared detail again
        formattedString += `\n\nTotal DEF: ${formatSpacing(itemDetails['total_def'])}`;
    }
    // details by weapon type
    if (pdps.includes(itemDetails['type']))
        formattedString += `\nTotal PDPS Stat (PATK+T.DEF): ${formatSpacing(itemDetails['pdps'])}`;
    if (mdps.includes(itemDetails['type']))
        formattedString += `\nTotal MDPS Stat (MATK+T.DEF): ${formatSpacing(itemDetails['mdps'])}`;
    formattedString += `\nTotal Stat: ${itemDetails['total_stat'].replace(whitespace_regex, '')}\`\`\``;
    return formattedString;
};

module.exports.formatArmorStats = function(itemDetails){
    formattedString = `\`\`\`\nPDEF: ${formatSpacing(itemDetails['pdef'])}\tMDEF: ${formatSpacing(itemDetails['mdef'])}\
        \n\nTotal DEF: ${formatSpacing(itemDetails['total_stat']).replace(whitespace_regex, '')}\`\`\``;
    return formattedString;
};

module.exports.formatSkills = function(itemDetails, type){
    if (type == 'weapon'){
        formattedString = `**${itemDetails['story_skill'].split('\n')[0]}**: ${itemDetails['story_skill'].split('\n')[1]}\
            \n\n**${itemDetails['colo_skill'].split('\n')[0]}**: ${itemDetails['colo_skill'].split('\n')[1]}\
            \n\n**${itemDetails['colo_support'].split('\n')[0]}**: ${itemDetails['colo_support'].split('\n')[1]}`
    }
    else if (type == 'armor'){
        formattedString = `**${itemDetails['story_skill'].split('\n')[0]}**: ${itemDetails['story_skill'].split('\n')[1]}\
            \n\n**${itemDetails['set_effect'].split('\n')[0]}**: ${itemDetails['set_effect'].split('\n')[1]}`
    }
    return formattedString;
};

function capitalize(item){
    return item[0].toUpperCase() + item.slice(1);
};

// returns the full name of the armor item    ex. 2B's Goggles [Blade] / Nameless Youth's Hairband (Blade)
module.exports.getFullName = function(itemSet, item, itemWeapon){
    fullItemNameParens = `${itemSet[item]} (${capitalize(itemWeapon)})`;
    fullItemNameBrackets = `${itemSet[item]} [${capitalize(itemWeapon)}]`;
    if (fullItemNameParens in armorDB)
        fullItemName = fullItemNameParens;
    else if (fullItemNameBrackets in armorDB)
        fullItemName = fullItemNameBrackets;
    else{
        console.log('The item was not found in the database');
        message.channel.send('The item was not found in the database');
        exit();
    }
    return fullItemName;
};