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
		'template_item_type': '(//tbody//tr)[_INDEX_]//img[contains(@class, "eqtypeImg")]',
		'template_element': '(//tbody//tr)[_INDEX_]//img[contains(@class, "attrImg")]',
		'template_patk': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxPAtk")]',
		'template_pdef': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxPDef")]',
		'template_matk': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxMAtk")]',
		'template_mdef': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxMDef")]',
		'template_total_stat': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxTotal")]',
		'template_total_atk': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxTotalAtk")]',
		'template_total_def': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxTotalDef")]',
		'template_pdps': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxAtkImp")]',
		'template_mdps': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colMaxMAtkImp")]',
		'template_weapon_cost': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colCost")]',
		'template_colo_skill': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colGvgSkill")]',
		'template_colo_support': '(//tbody//tr)[_INDEX_]//td[contains(@class, "colGvgAidSkill")]'
}

def initialize_driver(url):
	driver = webdriver.Chrome(ChromeDriverManager().install())
	driver.implicitly_wait(10)
	driver.maximize_window()
	time.sleep(2)
	driver.get(url)
	return driver

def switch_to_global(driver):
	driver.find_element_by_css_selector(locator['settings_button']).click()
	driver.find_element_by_xpath(locator['global_button']).click()
	driver.find_element_by_css_selector(locator['submit_button']).click()

def enable_categories(driver, type):
	driver.find_element_by_xpath(locator['field_button']).click()
	if type == 'weapons':
		categories = ['Tt.ATK', 'Tt.DEF', 'PATK+Tt.DEF', 'MATK+Tt.DEF']
	elif type == 'armor':
		categories = ['Set Tt.']
	for category in categories:
		driver.find_element_by_xpath(locator['template_category_button'].replace('_CATEGORY_', category)).click()
		driver.find_element_by_css_selector(locator['submit_button']).click()

def get_weapon_details(driver, index):
	itemType = driver.find_element_by_xpath(locator['template_item_type'].replace('_INDEX_', str(i))).get_attribute('src')
	itemElement = driver.find_element_by_xpath(locator['template_element'].replace('_INDEX_', str(i))).get_attribute('src')
	itemDetails = {
		'altName': driver.find_element_by_xpath(locator['template_alt_name'].replace('_INDEX_', str(i))).text,
		'weapon_type': weaponTypes[itemType],
		'ele': elements[itemElement],
		'patk': driver.find_element_by_xpath(locator['template_patk'].replace('_INDEX_', str(i))).text,
		'pdef': driver.find_element_by_xpath(locator['template_pdef'].replace('_INDEX_', str(i))).text,
		'matk': driver.find_element_by_xpath(locator['template_matk'].replace('_INDEX_', str(i))).text,
		'mdef': driver.find_element_by_xpath(locator['template_mdef'].replace('_INDEX_', str(i))).text,
		'total_stat': driver.find_element_by_xpath(locator['template_total_stat'].replace('_INDEX_', str(i))).text,
		'total_atk': driver.find_element_by_xpath(locator['template_total_atk'].replace('_INDEX_', str(i))).text,
		'total_def': driver.find_element_by_xpath(locator['template_total_def'].replace('_INDEX_', str(i))).text,
		'pdps': driver.find_element_by_xpath(locator['template_pdps'].replace('_INDEX_', str(i))).text,
		'mdps': driver.find_element_by_xpath(locator['template_mdps'].replace('_INDEX_', str(i))).text,
		'weapon_cost': driver.find_element_by_xpath(locator['template_weapon_cost'].replace('_INDEX_', str(i))).text,
		'colo_skill': driver.find_element_by_xpath(locator['template_colo_skill'].replace('_INDEX_', str(i))).text,
		'colo_support': driver.find_element_by_xpath(locator['template_colo_support'].replace('_INDEX_', str(i))).text
	}
	return itemDetails

def get_armor_details(driver, index):
	return

def get_nightmare_details(driver, index):
	return

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

	weaponTypes = {
		'https://sinoalice.game-db.tw/images/weapon_icon_001.png': 'instrument',
		'https://sinoalice.game-db.tw/images/weapon_icon_002.png': 'tome',
		'https://sinoalice.game-db.tw/images/weapon_icon_003.png': 'orb',
		'https://sinoalice.game-db.tw/images/weapon_icon_004.png': 'staff',
		'https://sinoalice.game-db.tw/images/weapon_icon_005.png': 'sword',
		'https://sinoalice.game-db.tw/images/weapon_icon_006.png': 'hammer',
		'https://sinoalice.game-db.tw/images/weapon_icon_007.png': 'ranged',
		'https://sinoalice.game-db.tw/images/weapon_icon_008.png': 'spear'

	}

	elements = {
		'https://sinoalice.game-db.tw/images/attribute_001.png': 'fire',
		'https://sinoalice.game-db.tw/images/attribute_002.png': 'water',
		'https://sinoalice.game-db.tw/images/attribute_003.png': 'wind'
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
				console.log(f'Argument for the command is not recognized {arg}')
				return
			itemType = arg

	# Connect to the URL and scrape data
	driver = initialize_driver(urlDict[itemType])

	switch_to_global(driver)
	enable_categories(driver, itemType)

	# Scrape data
	elem = driver.find_elements_by_xpath(locator['table_row'])
	numElements = len(elem)
	itemsDict = {}
	for i in range(1, numElements+1):
		itemName = driver.find_element_by_xpath(locator['template_item_name'].replace('_INDEX_', str(i))).text
		itemDetails = {}
		if type == 'weapons':
			itemDetails = get_weapon_details(driver, index)
		elif type == 'armor':
			itemDetails = get_armor_details(driver, index)
		elif type == 'nightmares':
			itemDetails = get_nightmare_details(driver, index)
		else:
			console.log(f'Argument for the command is not recognized {type}. Execution should not have reached here')
		itemsDict[itemName] = itemDetails
	driver.close()

	# Dump data to file
	with open(fileName[itemType], 'w', encoding='utf8') as outputFile:
		json.dump(itemsDict, outputFile, ensure_ascii=False)

if __name__ == "__main__":
	main(sys.argv[1:])