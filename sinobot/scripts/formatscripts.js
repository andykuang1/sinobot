const weapontypesaliases = require('../database/weapontypesaliases.json');

whitespace_regex = /\s+/g;
parenbrackets_regex = /[\[\]\(\)]/g;

//takes and returns a string
function formatSpacing(number){
    return (number < 1000) ? ' ' + number : number;
}

module.exports.capitalize = function(item){
    stringToBuild = [];
    item.split(' ').forEach(word =>{
        stringToBuild.push(word[0].toUpperCase() + word.slice(1));
    })
    return stringToBuild.join(' ');
};

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

// takes in an arg such as "set hammer replicant" and returns [itemName, itemWeapon] ex. ['replicant', 'Heavy']
module.exports.parseArmorArgument = function(args){
    if (['set', 'head', 'hands', 'feet', 'body'].includes(args[0].toLowerCase())){
        itemWeapon = args[1];
        // !armor [itemType] [itemWeapon] [itemName]    ex. !armor set hammer replicant
        if (weapontypesaliases.includes(itemWeapon.toLowerCase())){
            itemWeapon = weapontypesaliases[itemWeapon];
            itemName = args.slice(2).join(' ');
        }
        // no [itemWeapon] - !armor [itemType] [itemName]    ex. !armor set replicant
        else{
            itemWeapon = 'Blade';
            itemName = args.slice(1).join(' ');
        }

    }
    // no [itemType]
    else{
        itemWeapon = args[0];
        // !armor [itemWeapon] [itemName]    ex. !armor hammer replicant
        if (itemWeapon.toLowerCase() in weapontypesaliases){
            itemName = args.slice(1).join(' ');
            itemWeapon = weapontypesaliases[itemWeapon];
        }
        // no [itemWeapon] - !armor [itemName]    ex. !armor replicant
        else{
            potentialWeapon = args.slice(args.length-1).join(' ').replace(parenbrackets_regex, '').toLowerCase();
            if (potentialWeapon in weapontypesaliases){
                itemWeapon = weapontypesaliases[potentialWeapon];
                itemName = args.slice(0, args.length-1).join(' ');
            }
            else{
                itemWeapon = 'Blade';
                itemName = args.join(' ');
            }
        }
    }
    return [itemName, itemWeapon];
};
