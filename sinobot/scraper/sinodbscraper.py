import sys
import getopt
import time
import json
import unicodedata
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
	'template_item_name': '(//tbody//tr)[_INDEX_]//a[contains(@class, "enname")]',
	'template_alt_name': '(//tbody//tr)[_INDEX_]//span[contains(@class, "rawname")]',
	'template_element': '(//tbody//tr)[_INDEX_]//img[contains(@class, "attrImg")]',
	# Weapons
	'template_item_type': '(//tbody//tr)[_INDEX_]//img[contains(@class, "eqtypeImg")]',
	'template_item_table_cell': '(//tbody//tr)[_INDEX_]//td[contains(@class, "_CLASS_")]',
	# Armor
	'template_effective_against': '(//tbody//tr)[_INDEX_]//span[contains(@class, "en")]'

	# Nightmares
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
	'weapon_cost': 'colCost',
	'colo_skill': 'colGvgSkill',
	'colo_support': 'colGvgAidSkill'
}

armor_element_classes = {
}

## used for itemDetails[weapon_type] and itemDetails[ele] in get_item_details
weaponTypes = {
	'https://sinoalice.game-db.tw/images/weapon_icon_001.png': 'Instrument',
	'https://sinoalice.game-db.tw/images/weapon_icon_002.png': 'Tome',
	'https://sinoalice.game-db.tw/images/weapon_icon_003.png': 'Orb',
	'https://sinoalice.game-db.tw/images/weapon_icon_004.png': 'Staff',
	'https://sinoalice.game-db.tw/images/weapon_icon_005.png': 'Sword',
	'https://sinoalice.game-db.tw/images/weapon_icon_006.png': 'Hammer',
	'https://sinoalice.game-db.tw/images/weapon_icon_007.png': 'Ranged',
	'https://sinoalice.game-db.tw/images/weapon_icon_008.png': 'Spear'
}

elements = {
	'https://sinoalice.game-db.tw/images/attribute_001.png': 'Fire',
	'https://sinoalice.game-db.tw/images/attribute_002.png': 'Water',
	'https://sinoalice.game-db.tw/images/attribute_003.png': 'Wind'
}

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

def enable_categories(driver, itemType):
	driver.find_element_by_xpath(locator['field_button']).click()
	categories = []
	if itemType == 'weapons':
		categories = ['Tt.ATK', 'Tt.DEF', 'PATK+Tt.DEF', 'MATK+Tt.DEF']
	elif itemType == 'armor':
		categories = []
	elif itemType == 'nightmares':
		categories = []
	for category in categories:
		driver.find_element_by_xpath(locator['template_category_button'].replace('_CATEGORY_', category)).click()
	driver.find_element_by_css_selector(locator['submit_button']).click()

def get_item_details(driver, index, itemType):
	# Shared Elements
	itemElement = driver.find_element_by_xpath(locator['template_element'].replace('_INDEX_', str(index))).get_attribute('src')
	itemDetails = {
		'altName': driver.find_element_by_xpath(locator['template_alt_name'].replace('_INDEX_', str(index))).text,
		'ele': elements[itemElement],
	}
	item_element_classes = {}
	# Unique elements and get list of classes/elements
	if itemType == 'weapons':
		itemType = driver.find_element_by_xpath(locator['template_item_type'].replace('_INDEX_', str(index))).get_attribute('src')
		itemDetails['weapon_type'] = weaponTypes[itemType]
		item_element_classes = weapon_element_classes
	elif itemType == 'armor':
		enemyType = driver.find_element_by_xpath(locator['template_effective_against'].replace('_INDEX_', str(index))).text
		itemDetails['effective_against'] = enemyType
		item_element_classes = armor_element_classes
	elif itemType == 'nightmares':
		item_element_classes = nightmare_element_classes
	else:
		print(f'Argument for the command is not recognized {itemType}. Execution should not have reached here')

	# Iterate through unique elements
	for key in item_element_classes.keys():
		itemDetails[key] = driver.find_element_by_xpath(locator['template_item_table_cell'].replace('_INDEX_', str(index)).replace('_CLASS_', item_element_classes[key])).text
	return itemDetails

def main(argv):
	urlDict = {
		'weapons': 'https://sinoalice.game-db.tw/weapons',
		'armor': 'https://sinoalice.game-db.tw/armor',
		'nightmares': 'https://sinoalice.game-db.tw/nightmares'
	}
	fileNameDict = {
		'weapons': 'database/weaponsDB.json',
		'armor': 'database/armorDB.json',
		'nightmares': 'database/nightmareDB.json'
	}

	itemType = ''
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
			itemType = arg

	if itemType == '':
		print('Options are not valid')
		sys.exit(2)

	# Connect to the URL
	driver = initialize_driver(urlDict[itemType])

	# Apply correct filters
	switch_to_global(driver)
	enable_categories(driver, itemType)

	# Scrape data
	elem = driver.find_elements_by_xpath(locator['table_row'])
	numElements = len(elem)
	itemsDict = {}
	for i in range(1, numElements+1):
		itemName = driver.find_element_by_xpath(locator['template_item_name'].replace('_INDEX_', str(i))).text
		itemDetails = get_item_details(driver, i, itemType)
		itemsDict[itemName] = itemDetails
	driver.close()

	# Dump data to file
	with open(fileNameDict[itemType], 'w', encoding='utf8') as outputFile:
		json.dump(itemsDict, outputFile, ensure_ascii=False)

if __name__ == "__main__":
	main(sys.argv[1:])