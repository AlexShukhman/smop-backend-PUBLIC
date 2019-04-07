from pyvirtualdisplay import Display
from selenium import webdriver
import sys

display = Display(visible=0, size=(800, 600))
display.start()
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--no-sandbox')
driver = webdriver.Chrome('/usr/local/bin/chromedriver', chrome_options=chrome_options)
