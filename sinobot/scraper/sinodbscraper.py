import sys
import getopt
import time
import json
import unicodedata
import mysql.connector
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager

locator = {
	# Control Buttons
	'field_button': '//div[contains(@class, "ctrlbtns")]//div[contains(text(), "Field")]',
	'settings_button': 'div.settingBtn',
	# Field Module
	'template_category_button': '//div[contains(@class, "sortBtn")][text()="_CATEGORY_"]',
	# Settings Module
	'global_button': '//div[contains(@class, "radioBtn")][contains(text(), "Global")]',
	'submit_button': 'div.dialogOK2',
	# Shared
	'table_row': '//tbody//tr',
	'template_item_table_cell': '(//tbody//tr)[_INDEX_]//td[contains(@class, "_CLASS_")]',
	'template_item_icon': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colIcon")]//img',
	'template_item_name': '(//tbody//tr)[_INDEX_]//a[contains(@class, "enname")]',
	'template_alt_name': '(//tbody//tr)[_INDEX_]//span[contains(@class, "rawname")]',
	'template_element': '(//tbody//tr)[_INDEX_]//img[contains(@class, "attrImg")]',
	# Weapons
	'template_item_type': '(//tbody//tr)[_INDEX_]//img[contains(@class, "eqtypeImg")]',
	'template_weapon_support_skill': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colGvgAidSkill")]',
	# Weapon + nightmare
	'template_story_skill': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colQuestSkill")]',
	'template_colo_skill': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colGvgSkill")]',
	# Armor
	'template_effective_against': '(//tbody//tr)[_INDEX_]//span[contains(@class, "en")]',
	'template_set_effect': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colEffectSeries")]'
}

## used for locator template_item_table_cell
weapon_element_classes = {
	'patk': 'colMaxPAtk',
	'pdef': 'colMaxPDef',
	'matk': 'colMaxMAtk',
	'mdef': 'colMaxMDef',
	'total_stat': 'colMaxTotal',
	'total_atk': 'colMaxTotalAtk',
	'total_def': 'colMaxTotalDef',
	'pdps': 'colMaxAtkImp',
	'mdps': 'colMaxMAtkImp',
	'weapon_cost': 'colCost'
}

armor_element_classes = {
	'item_type': 'colEqType',
	'pdef': 'colFullPDef',
	'mdef': 'colFullMDef',
	'total_stat': 'colFullTotal',
	'set_total': 'colMaxSetSummary',
	'story_skill': 'colArmorSkill'
}

nightmare_element_classes = {
	'base_patk': 'colFullPAtk',
	'base_pdef': 'colFullPDef',
	'base_matk': 'colFullMAtk',
	'base_mdef': 'colFullMDef',
	'base_total': 'colFullTotal',
	'evo_patk': 'colMaxPAtk',
	'evo_pdef': 'colMaxPDef',
	'evo_matk': 'colMaxMAtk',
	'evo_mdef': 'colMaxMDef',
	'evo_total': 'colMaxTotal',
	'total_atk': 'colMaxTotalAtk',
	'total_def': 'colMaxTotalDef',
	'pdps': 'colMaxAtkImp',
	'mdps': 'colMaxMAtkImp',
	'prep_time': 'colGvgSkillLead',
	'duration': 'colGvgSkillDur'
}

## used for itemDetails[weapon_type] and itemDetails[ele] in get_item_details
weaponTypes = {
	'https://sinoalice.game-db.tw/images/weapon_icon_001.png': 'Instrument',
	'https://sinoalice.game-db.tw/images/weapon_icon_002.png': 'Tome',
	'https://sinoalice.game-db.tw/images/weapon_icon_003.png': 'Artifact',
	'https://sinoalice.game-db.tw/images/weapon_icon_004.png': 'Staff',
	'https://sinoalice.game-db.tw/images/weapon_icon_005.png': 'Blade',
	'https://sinoalice.game-db.tw/images/weapon_icon_006.png': 'Heavy',
	'https://sinoalice.game-db.tw/images/weapon_icon_007.png': 'Projectile',
	'https://sinoalice.game-db.tw/images/weapon_icon_008.png': 'Polearm'
}

elements = {
	'https://sinoalice.game-db.tw/images/attribute_001.png': 'Fire',
	'https://sinoalice.game-db.tw/images/attribute_002.png': 'Water',
	'https://sinoalice.game-db.tw/images/attribute_003.png': 'Wind'
}

## used for table statements

def initialize_driver(url):
	#options = webdriver.ChromeOptions()
	#options.add_experimental_option("excludeSwitches", ['enable-logging'])
	#chromeCapabilities.set('chromeOptions', chrome_options=options)
	driver = webdriver.Chrome(ChromeDriverManager().install())
	#driver = webdriver.Chrome(ChromeDriverManager().install(), capabilities = chromeCapabilities)
	driver.implicitly_wait(10)
	driver.maximize_window()
	time.sleep(2)
	driver.get(url)
	return driver

def switch_to_global(driver):
	driver.find_element_by_css_selector(locator['settings_button']).click()
	driver.find_element_by_xpath(locator['global_button']).click()
	driver.find_element_by_css_selector(locator['submit_button']).click()

def enable_categories(driver, input_type):
	driver.find_element_by_xpath(locator['field_button']).click()
	categories = []
	if input_type == 'weapons' or input_type == 'nightmares':
		categories = ['Tt.ATK', 'Tt.DEF', 'PATK+Tt.DEF', 'MATK+Tt.DEF']
	elif input_type == 'armor':
		categories = []
	for category in categories:
		driver.find_element_by_xpath(locator['template_category_button'].replace('_CATEGORY_', category)).click()
	driver.find_element_by_css_selector(locator['submit_button']).click()

def get_item_details(driver, index, input_type):
	# Shared Elements
	itemDetails = {
		'icon': driver.find_element_by_xpath(locator['template_item_icon'].replace('_INDEX_', str(index))).get_attribute('src'),
		'altName': driver.find_element_by_xpath(locator['template_alt_name'].replace('_INDEX_', str(index))).text,
	}
	if input_type != 'nightmares':
		itemElement = driver.find_element_by_xpath(locator['template_element'].replace('_INDEX_', str(index))).get_attribute('src')
		itemDetails['ele'] = elements[itemElement]
	if input_type != 'armor':
		itemDetails['story_skill'] = driver.find_element_by_xpath(locator['template_story_skill'].replace('_INDEX_', str(index))).text
		itemDetails['colo_skill'] = driver.find_element_by_xpath(locator['template_colo_skill'].replace('_INDEX_', str(index))).text

	item_element_classes = {}
	# Unique elements and get list of classes/elements
	if input_type == 'weapons':
		itemType = driver.find_element_by_xpath(locator['template_item_type'].replace('_INDEX_', str(index))).get_attribute('src')
		itemDetails['item_type'] = weaponTypes[itemType]
		itemDetails['colo_support'] = driver.find_element_by_xpath(locator['template_weapon_support_skill'].replace('_INDEX_', str(index))).text
		item_element_classes = weapon_element_classes
	elif input_type == 'armor':
		itemDetails['effective_against'] = driver.find_element_by_xpath(locator['template_effective_against'].replace('_INDEX_', str(index))).text
		itemDetails['set_effect'] = driver.find_element_by_xpath(locator['template_set_effect'].replace('_INDEX_', str(index))).text
		item_element_classes = armor_element_classes
	elif input_type == 'nightmares':
		item_element_classes = nightmare_element_classes
	else:
		print(f'Argument for the command is not recognized {input_type}. Execution should not have reached here')

	# Iterate through unique elements
	for key in item_element_classes:
		itemDetails[key] = driver.find_element_by_xpath(locator['template_item_table_cell'].replace('_INDEX_', str(index)).replace('_CLASS_', item_element_classes[key])).text
	return itemDetails

def get_insert_params(itemDetails, input_type):
	if input_type == 'weapons':
		params = [itemDetails['itemName'], itemDetails['icon'], itemDetails['altName'], itemDetails['ele'], 
			itemDetails['story_skill'], itemDetails['colo_skill'], itemDetails['item_type'], itemDetails['colo_support'], itemDetails['patk'], 
			itemDetails['pdef'], itemDetails['matk'], itemDetails['mdef'], itemDetails['total_stat'], itemDetails['total_atk'], itemDetails['total_def'], 
			itemDetails['pdps'], itemDetails['mdps'], itemDetails['weapon_cost']]
	elif input_type == 'armor':
		params = [itemDetails['itemName'], itemDetails['icon'], itemDetails['altName'], itemDetails['ele'], itemDetails['effective_against'],
		itemDetails['set_effect'], itemDetails['item_type'], itemDetails['pdef'], itemDetails['mdef'], itemDetails['total_stat'], itemDetails['set_total'],
		itemDetails['story_skill']]
	elif input_type == 'nightmares':
		params = [itemDetails['itemName'], itemDetails['icon'], itemDetails['altName'], itemDetails['story_skill'], itemDetails['colo_skill'],
		itemDetails['base_patk'], itemDetails['base_pdef'], itemDetails['base_matk'], itemDetails['base_mdef'], itemDetails['base_total'],
		itemDetails['evo_patk'], itemDetails['evo_pdef'], itemDetails['evo_matk'], itemDetails['evo_mdef'], itemDetails['evo_total'],
		itemDetails['total_atk'], itemDetails['total_def'], itemDetails['pdps'], itemDetails['mdps'], itemDetails['prep_time'], itemDetails['duration']]
	else:
		return -1
	return params

def main(argv):
	urlDict = {
		'weapons': 'https://sinoalice.game-db.tw/weapons',
		'armor': 'https://sinoalice.game-db.tw/armor',
		'nightmares': 'https://sinoalice.game-db.tw/nightmares'
	}

	input_type = ''
	# Parse arguments
	try:
		opts, args = getopt.getopt(argv,"t:",["type="])
	except getopt.GetoptError:
		print('Options are not valid')
		sys.exit(2)
	for opt, arg in opts:
		if opt in ("-t", "--type"):
			if arg not in urlDict.keys():
				print(f'Argument for the command is not recognized {arg}')
				sys.exit(2)
			input_type = arg

	if input_type == '':
		print('Options are not valid')
		sys.exit(2)

	# Connect to DB
	mydb = mysql.connector.connect(
		host="localhost",
		user="PLACEHOLDERUSER",
		password="PLACEHOLDERPASSWORD",
		database="sinodb"
	)
	mycursor = mydb.cursor(buffered=True)

	# Connect to the URL
	driver = initialize_driver(urlDict[input_type])

	# Apply correct filters
	switch_to_global(driver)
	enable_categories(driver, input_type)

	# Scrape data
	elem = driver.find_elements_by_xpath(locator['table_row'])
	numElements = len(elem)
	if (numElements == 0):
		print('There were no items found')
		exit(-1)
	itemsDict = {}
	mycursor.execute(f"SELECT itemName FROM {input_type}db;")
	rows = mycursor.fetchall()
	currentDatabaseItems = [row[0] for row in rows]
	mycursor.execute(f"SELECT alias FROM {input_type}aliases")
	rows = mycursor.fetchall()
	currentAliases = [row[0] for row in rows]
	for i in range(1, numElements+1):
		itemName = driver.find_element_by_xpath(locator['template_item_name'].replace('_INDEX_', str(i))).text.replace('’', '\'')
		# Add common item aliases
		## Nameless Youth's -> [NamelessYouth's, nameless youth's, Nameless Youths, namelessyouth's, NamelessYouths, nameless youths, namelessyouths]
		differentAliases = {itemName, itemName.replace(' ', ''), itemName.replace('\'', ''), itemName.replace(' ', '').replace('\'', '')}
		addedAlias = False
		if itemName in currentDatabaseItems:
			for alias in differentAliases:
				if alias not in currentAliases:
					mycursor.execute(f"""INSERT INTO {input_type}aliases (alias, originalName) VALUES (%s, %s);""", [alias, itemName])
			addedAlias = True
			continue
		itemDetails = get_item_details(driver, i, input_type)
		itemDetails['itemName'] = itemName
		if input_type == 'weapons':
			mycursor.execute(f"""INSERT INTO {input_type}db (itemName, icon, altName, ele, story_skill, colo_skill, item_type, colo_support, patk, pdef, matk, mdef, 
				total_stat, total_atk, total_def, pdps, mdps, weapon_cost) 
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);""", get_insert_params(itemDetails, input_type))
		elif input_type == 'armor':
			mycursor.execute(f"""INSERT INTO {input_type}db (itemName, icon, altName, ele, effective_against, set_effect, item_type, pdef, mdef, total_stat, 
				set_total, story_skill) 
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);""", get_insert_params(itemDetails, input_type))
		elif input_type == 'nightmares':
			mycursor.execute(f"""INSERT INTO {input_type}db (itemName, icon, altName, story_skill, colo_skill, base_patk, base_pdef, base_matk, base_mdef, base_total, 
				evo_patk, evo_pdef, evo_matk, evo_mdef, evo_total, total_atk, total_def, pdps, mdps, prep_time, duration) 
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);""", get_insert_params(itemDetails, input_type))
		if not addedAlias:
			for alias in differentAliases:
				if alias not in currentAliases:
					mycursor.execute(f"""INSERT INTO {input_type}aliases (alias, originalName) VALUES (%s, %s);""", [alias, itemName])
			addedAlias = True
	driver.close()
	mycursor.close()
	mydb.commit()
	mydb.close()

if __name__ == "__main__":
	main(sys.argv[1:])