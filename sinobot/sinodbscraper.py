import sys
import getopt
import time
import json
import unicodedata
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager

def main(argv):

	locator = {
		'settings_button': 'div.settingBtn',
		'global_button': '//div[contains(@class, "radioBtn")][contains(text(), "Global")]',
		'submit_button': 'div.dialogOK2',
		'table_row': '//tbody//tr',
		'template_item_name': '(//tbody//tr)[_INDEX_]//a[contains(@class, "enname")]',
		'template_alt_name': '(//tbody//tr)[_INDEX_]//span[contains(@class, "rawname")]'
	}

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

	url = ''

	# Parse arguments
	try:
		opts, args = getopt.getopt(argv,"t:",["type="])
	except getopt.GetoptError:
		print('Options are not valid')
		sys.exit(2)
	for opt, arg in opts:
		if opt in ("-t", "--type"):
			url = urlDict[arg]
			fileName = fileNameDict[arg]

	# Connect to the URL and scrape data
	driver = webdriver.Chrome(ChromeDriverManager().install())
	driver.implicitly_wait(10)
	driver.get(url)

	# Switch to global
	driver.find_element_by_css_selector(locator['settings_button']).click()
	driver.find_element_by_xpath(locator['global_button']).click()
	driver.find_element_by_css_selector(locator['submit_button']).click()

	elem = driver.find_elements_by_xpath(locator['table_row'])
	numElements = len(elem)
	itemsDict = {}
	for i in range(1, numElements+1):
		itemName = driver.find_element_by_xpath(locator['template_item_name'].replace('_INDEX_', str(i))).text
		itemDetails = {
			'altName': driver.find_element_by_xpath(locator['template_alt_name'].replace('_INDEX_', str(i))).text
		}
		itemsDict[itemName] = itemDetails
	driver.close()

	with open(fileName, 'w', encoding='utf8') as outputFile:
		json.dump(itemsDict, outputFile, ensure_ascii=False)

if __name__ == "__main__":
	main(sys.argv[1:])