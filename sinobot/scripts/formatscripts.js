const weapontypesaliases = require('../database/weapontypesaliases.json');
const armoraliases = require('../database/armoraliases.json');

const dbscripts = require('./dbscripts.js')

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

// takes in an arg such as "set hammer replicant" and returns [itemName, itemWeapon] ex. ['replicant', 'Heavy']
module.exports.parseArmorArgument = function(args){
    if (['set', 'head', 'hands', 'feet', 'body'].includes(args[0].toLowerCase())){
        itemWeapon = args[1];
        // !armor [itemType] [itemWeapon] [itemName]    ex. !armor set hammer replicant
        if (itemWeapon.toLowerCase() in weapontypesaliases){
            itemName = args.slice(2).join(' ');
            itemSet = dbscripts.getArmorSet(itemName);
            itemWeapon = weapontypesaliases[itemWeapon.toLowerCase()];
            // Special case for sets like invader that don't have all weapon types
            if (itemSet != -1 && 'special' in itemSet && !(itemSet['special'].includes(itemWeapon))){
                return [-1, armoraliases[itemName.toLowerCase()]];
            }
        }
        // no [itemWeapon] - !armor [itemType] [itemName]    ex. !armor set replicant
        else{
                itemName = args.slice(1).join(' ');
                itemSet = dbscripts.getArmorSet(itemName)
                if (itemSet != -1 && 'special' in itemSet){
                    arrayLength = itemSet['special'].length;
                    itemWeapon = itemSet['special'][Math.floor(Math.random() * arrayLength)];
                }
                else
                    itemWeapon = 'Blade';
        }
    }
    // no [itemType]
    else{
        itemWeapon = args[0];
        // !armor [itemWeapon] [itemName]    ex. !armor hammer replicant
        if (itemWeapon.toLowerCase() in weapontypesaliases){
            itemName = args.slice(1).join(' ');
            itemSet = dbscripts.getArmorSet(itemName)
            itemWeapon = weapontypesaliases[itemWeapon.toLowerCase()];
            // Special case for sets like invader that don't have all weapon types
            if (itemSet != -1 && 'special' in itemSet && !(itemSet['special'].includes(itemWeapon))){
                return [-1, armoraliases[itemName.toLowerCase()]];
            }
        }
        // no [itemWeapon] - !armor [itemName]    ex. !armor replicant
        else{
            potentialWeapon = args.slice(args.length-1).join(' ').replace(parenbrackets_regex, '').toLowerCase();
            if (potentialWeapon in weapontypesaliases){
                itemWeapon = weapontypesaliases[potentialWeapon];
                itemName = args.slice(0, args.length-1).join(' ');
                itemSet = dbscripts.getArmorSet(itemName);
                itemWeapon = weapontypesaliases[itemWeapon.toLowerCase()];
                // Special case for sets like invader that don't have all weapon types
                if (itemSet != -1 && 'special' in itemSet && !(itemSet['special'].includes(itemWeapon))){
                    return [-1, armoraliases[itemName.toLowerCase()]];
                }
            }
            else{
                itemName = args.join(' ');
                itemSet = dbscripts.getArmorSet(itemName);
                if (itemSet != -1 && 'special' in itemSet){
                    arrayLength = itemSet['special'].length;
                    itemWeapon = itemSet['special'][Math.floor(Math.random() * arrayLength)];
                }
                else
                    itemWeapon = 'Blade';
            }
        }
    }
    return [itemName, itemWeapon];
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
        formattedString += `\nTotal P.DPS Stat (P.ATK+T.DEF): ${formatSpacing(itemDetails['pdps'])}`;
    if (mdps.includes(itemDetails['type']))
        formattedString += `\nTotal M.DPS Stat (M.ATK+T.DEF): ${formatSpacing(itemDetails['mdps'])}`;
    formattedString += `\nTotal Stat: ${itemDetails['total_stat'].replace(whitespace_regex, '')}\`\`\``;
    return formattedString;
};

module.exports.formatArmorStats = function(itemDetails){
    formattedString = `\`\`\`\nPDEF: ${formatSpacing(itemDetails['pdef'])}\tMDEF: ${formatSpacing(itemDetails['mdef'])}\
        \n\nTotal DEF: ${formatSpacing(itemDetails['total_stat']).replace(whitespace_regex, '')}\`\`\``;
    return formattedString;
};

module.exports.formatNightmareStats = function(itemDetails){
    formattedString = `\`\`\`0LB Stats:\
        \nPATK: ${formatSpacing(itemDetails['base_patk'])}\tMATK: ${formatSpacing(itemDetails['base_matk'])}\
        \nPDEF: ${formatSpacing(itemDetails['base_pdef'])}\tMDEF: ${formatSpacing(itemDetails['base_mdef'])}\
        \nTotal Stat: ${itemDetails['base_total'].replace(whitespace_regex, '')}\
        \n\nMLB Stats: \
        \nPATK: ${formatSpacing(itemDetails['evo_patk'])}\tMATK: ${formatSpacing(itemDetails['evo_matk'])}\
        \nPDEF: ${formatSpacing(itemDetails['evo_pdef'])}\tMDEF: ${formatSpacing(itemDetails['evo_mdef'])}\
        \nTotal Stat: ${itemDetails['evo_total'].replace(whitespace_regex, '')}
        \n\nTotal MLB DEF: ${formatSpacing(itemDetails['total_def']).replace(whitespace_regex, '')}\
        \nTotal MLB P.DPS Stat (P.ATK+T.DEF): ${formatSpacing(itemDetails['pdps'])}\
        \nTotal MLB M.DPS Stat (M.ATK+T.DEF): ${formatSpacing(itemDetails['mdps'])}\`\`\``
    return formattedString;
}

module.exports.formatSkills = function(itemDetails, type){
    if (type == 'weapon'){
        formattedString = `*Story*\n**${itemDetails['story_skill'].split('\n')[0]}**: ${itemDetails['story_skill'].split('\n')[1]}\
            \n\n*Colosseum*\n**${itemDetails['colo_skill'].split('\n')[0]}**: ${itemDetails['colo_skill'].split('\n')[1]}\
            \n\n*Colosseum Support*\n**${itemDetails['colo_support'].split('\n')[0]}**: ${itemDetails['colo_support'].split('\n')[1]}`
    }
    else if (type == 'armor'){
        formattedString = `*Story*\n**${itemDetails['story_skill'].split('\n')[0]}**: ${itemDetails['story_skill'].split('\n')[1]}\
            \n\n*Set Effect*\n**${itemDetails['set_effect'].split('\n')[0]}**: ${itemDetails['set_effect'].split('\n')[1]}`
    }
    else if (type == 'nightmare'){
        if (itemDetails['duration'] == 0){
            duration = 'Permanent';
            label = '';
        }
        else{
            duration = itemDetails['duration'];
            label = 'seconds';
        }
        formattedString = `*Story*\n **${itemDetails['story_skill'].split('\n')[0]}**: ${itemDetails['story_skill'].split('\n')[1]}\
            \n\n*Colosseum*\n**${itemDetails['colo_skill'].split('\n')[0]}**: ${itemDetails['colo_skill'].split('\n')[1]}\
            \nPreparation Time: **${itemDetails['prep_time']} seconds**\
            \nDuration: **${duration} ${label}**`
    }
    return formattedString;
};
