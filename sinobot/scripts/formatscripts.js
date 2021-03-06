const weapontypesaliases = require('../database/weapontypesaliases.json');

const dbscripts = require('./dbscripts.js')

whitespace_regex = /\s+/g;
parenbrackets_regex = /[\[\]\(\)]/g;

//takes and returns a string
function formatSpacing(number){
    return (number < 1000) ? '' + number : number;
}

module.exports.capitalize = function(item){
    stringToBuild = [];
    item.split(' ').forEach(word =>{
        stringToBuild.push(word[0].toUpperCase() + word.slice(1));
    })
    return stringToBuild.join(' ');
};

// ------------------------------------------------------ ARGUMENT PARSING ------------------------------------------------------

module.exports.parseWeaponsFilterArgument = async function(arg){
    var page = 1;
    elements = new Set();
    var cost = new Set();
    for (item of arg){
        if (item.toLowerCase().includes('page:'))
            page = item.replace('page:', '');
        else if (item.toLowerCase().includes('cost:')){
            costText = item.replace('cost:', '');
            costArray = costText.split(',');
            costArray.forEach(item => {cost.add(item);});
        }
        else if (await dbscripts.getItem(item, 'elements') != -1){
            elements.add(await dbscripts.getOriginalName(item, 'elements'));
        }
    }
    if (elements.size == 0){
        data = await dbscripts.get_column('elementsDB', 'itemName');
        data.forEach(row => {
            elements.add(row.itemName);
        });
    }
    if (cost.size == 0){
        for (i=1; i<100; i++)
            cost.add(i);
    }
    return {'page': page, 'ele': elements, 'cost': cost};
};

// takes in an arg such as "set hammer replicant" and returns [itemName, itemWeapon] ex. ['replicant', 'Heavy']
module.exports.parseArmorArgument = async function(args){
    // has [itemType], so is an armor set
    if (['set', 'head', 'hands', 'feet', 'body'].includes(args[0].toLowerCase())){
        itemWeapon = args[1];
        // !armor [itemType] [itemWeapon] [itemName]    ex. !armor set hammer replicant
        if (itemWeapon.toLowerCase() in weapontypesaliases){
            itemName = args.slice(2).join(' ');
            itemSet = await dbscripts.getArmorSet(itemName);
            itemWeapon = weapontypesaliases[itemWeapon.toLowerCase()];
            // Special case for sets like invader that don't have all weapon types
            if (itemSet != -1 && 'special' in itemSet && !(itemSet['special'].includes(itemWeapon))){
                console.log(itemName);
                originalName = await dbscripts.getOriginalName(itemName, 'armorsets');
                return [-1, originalName];
            }
        }
        // no [itemWeapon] - !armor [itemType] [itemName]    ex. !armor set replicant
        else{
                itemName = args.slice(1).join(' ');
                itemSet = await dbscripts.getArmorSet(itemName);
                if (itemSet != -1 && 'special' in itemSet){
                    arrayLength = itemSet['special'].length;
                    itemWeapon = itemSet['special'][Math.floor(Math.random() * arrayLength)];
                }
                else
                    itemWeapon = 'Blade';
        }
    }
    // no [itemType], can be armortype or individual item
    else{
        itemWeapon = args[0];
        // !armor [itemWeapon] [itemName]    ex. !armor hammer replicant
        if (itemWeapon.toLowerCase() in weapontypesaliases){
            itemName = args.slice(1).join(' ');
            itemSet = await dbscripts.getArmorSet(itemName)
            itemWeapon = weapontypesaliases[itemWeapon.toLowerCase()];
            // Special case for sets like invader that don't have all weapon types
            if (itemSet != -1 && 'special' in itemSet && !(itemSet['special'].includes(itemWeapon))){
                originalName = await dbscripts.getOriginalName(itemName, 'armorsets')
                return [-1, originalName];
            }
        }
        // no [itemWeapon] - !armor [itemName]    ex. !armor replicant
        else{
            potentialWeapon = args.slice(args.length-1).join(' ').replace(parenbrackets_regex, '').toLowerCase();
            if (potentialWeapon in weapontypesaliases){
                itemWeapon = weapontypesaliases[potentialWeapon];
                itemName = args.slice(0, args.length-1).join(' ');
                itemSet = await dbscripts.getArmorSet(itemName);
                itemWeapon = weapontypesaliases[itemWeapon.toLowerCase()];
                // Special case for sets like invader that don't have all weapon types
                if (itemSet != -1 && 'special' in itemSet && !(itemSet['special'].includes(itemWeapon))){
                    originalName = await dbscripts.getOriginalName(itemName, 'armorsets')
                    return [-1, originalName];
                }
            }
            else{
                itemName = args.join(' ');
                itemSet = await dbscripts.getArmorSet(itemName);
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

// ------------------------------------------------------ EMBED FORMATTING ------------------------------------------------------

module.exports.formatListItems = function(items, type){
    itemList = ''
    for (item of items){
        itemList += `[${item.itemName}](https://sinoalice.game-db.tw/${type}/${item.altName.replace(' ', '%20')})\n`
    }
    return itemList;
};

module.exports.formatWeaponStats = function(item){
    pdps = ['Hammer', 'Sword', 'Instrument', 'Tome'];
    mdps = ['Orb', 'Spear', 'Ranged', 'Instrument', 'Tome'];
    // Shared details first
    formattedString = `\`\`\`PATK: ${formatSpacing(item.patk)}\tMATK: ${formatSpacing(item.matk)}\
            \nPDEF: ${formatSpacing(item.pdef)}\tMDEF: ${formatSpacing(item.mdef)}
            \nCost: ${formatSpacing(item.weapon_cost)}`;
    // Total ATK only for supports
    if (['Instrument', 'Tome'].includes(item.type)){
        formattedString += `\n\nTotal ATK: ${formatSpacing(item.total_atk)}\
        \nTotal DEF: ${formatSpacing(item.total_def)}`;
    }
    else{
        // Shared detail again
        formattedString += `\n\nTotal DEF: ${formatSpacing(item.total_def)}`;
    }
    // details by weapon type
    if (pdps.includes(item.type))
        formattedString += `\nTotal P.DPS Stat (P.ATK+T.DEF): ${formatSpacing(item.pdps)}`;
    if (mdps.includes(item.type))
        formattedString += `\nTotal M.DPS Stat (M.ATK+T.DEF): ${formatSpacing(item.mdps)}`;
    formattedString += `\nTotal Stat: ${item.total_stat.replace(whitespace_regex, '')}\`\`\``;
    return formattedString;
};

module.exports.formatArmorStats = function(item){
    formattedString = `\`\`\`\nPDEF: ${formatSpacing(item.pdef)}\tMDEF: ${formatSpacing(item.mdef)}\
        \n\nTotal DEF: ${formatSpacing(item.total_stat).replace(whitespace_regex, '')}\`\`\``;
    return formattedString;
};

module.exports.formatNightmareStats = function(item){
    formattedString = `\`\`\`0LB Stats:\
        \nPATK: ${formatSpacing(item.base_patk)}\tMATK: ${formatSpacing(item.base_matk)}\
        \nPDEF: ${formatSpacing(item.base_pdef)}\tMDEF: ${formatSpacing(item.base_mdef)}\
        \nTotal Stat: ${item.base_total.replace(whitespace_regex, '')}\
        \n\nMLB Stats: \
        \nPATK: ${formatSpacing(item.evo_patk)}\tMATK: ${formatSpacing(item.evo_matk)}\
        \nPDEF: ${formatSpacing(item.evo_pdef)}\tMDEF: ${formatSpacing(item.evo_mdef)}\
        \nTotal Stat: ${item.evo_total.replace(whitespace_regex, '')}
        \n\nTotal MLB DEF: ${String(formatSpacing(item.total_def)).replace(whitespace_regex, '')}\
        \nTotal MLB P.DPS Stat (P.ATK+T.DEF): ${formatSpacing(item.pdps)}\
        \nTotal MLB M.DPS Stat (M.ATK+T.DEF): ${formatSpacing(item.mdps)}\`\`\``
    return formattedString;
}

module.exports.formatSkills = function(item, type){
    if (type == 'weapon'){
        formattedString = `*Story*\n**${item.story_skill.split('\n')[0]}**: ${item.story_skill.split('\n')[1]}\
            \n\n*Colosseum*\n**${item.colo_skill.split('\n')[0]}**: ${item.colo_skill.split('\n')[1]}\
            \n\n*Colosseum Support*\n**${item.colo_support.split('\n')[0]}**: ${item.colo_support.split('\n')[1]}`
    }
    else if (type == 'armor'){
        formattedString = `*Story*\n**${item.story_skill.split('\n')[0]}**: ${item.story_skill.split('\n')[1]}\
            \n\n*Set Effect*\n**${item.set_effect.split('\n')[0]}**: ${item.set_effect.split('\n')[1]}`
    }
    else if (type == 'nightmare'){
        if (item.duration == 0){
            duration = 'Permanent';
            label = '';
        }
        else{
            duration = item.duration;
            label = 'seconds';
        }
        formattedString = `*Story*\n **${item.story_skill.split('\n')[0]}**: ${item.story_skill.split('\n')[1]}\
            \n\n*Colosseum*\n**${item.colo_skill.split('\n')[0]}**: ${item.colo_skill.split('\n')[1]}\
            \nPreparation Time: **${item.prep_time} seconds**\
            \nDuration: **${duration} ${label}**`
    }
    return formattedString;
};

// -------------------------------------------------------- MISC SCRIPTS --------------------------------------------------------

module.exports.getPageOfItems = function(list, page){
    startIndex = (page-1) * 10;
    if (startIndex >= list.length){
        if (list.length % 10 == 0)
            startIndex = list.length - 10 - 1;
        else
            startIndex = list.length - (list.length % 10);
        endIndex = list.length;
    }
    endIndex = startIndex + 10;
    if (endIndex > list.length)
        endIndex = list.length;
    return list.slice(startIndex, endIndex);
}