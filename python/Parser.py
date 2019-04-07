import Lexer
class Parser:
    def __init__(self):
        self.ids = {}
    def parse(self, tokens, file, parth = False, url="index.php", t="php"):
        if '.' == url.split('/')[0]:
            url = url[2:]
        if parth:
            if t == "php":
                url = "localhost:8000/repo/"+url
            elif t == "html":
                url = "localhost:8000/repo/"+url
        else:
            url = "localhost:8000/" + url
        screenshots = 1
        with open(file, "a") as selenium: #change w back to a when finished with testing
            selenium.write("driver.get('"+url+"')\n")
            selenium.write("driver.save_screenshot('snap" + str(screenshots) + ".png')\n")
            for test in tokens:
                screenshots += 1
                for statement in test:
                    if len(statement) != 0:
                        if '->' in statement[0]:
                            findAssert = "driver.find_element_by_id('" + statement[2] + "')"
                            assertVal = " ".join(statement[4:])
                            try:
                                assertVal = int(assertVal)
                                assertVal = "'" + str(assertVal) + "'"
                            except:
                                pass
                            getCheck = "if " + statement[2] + ".get_attribute('" + statement[3] + "') is not None:\n\t" 
                            getAssert = "assert " + assertVal + " in " + statement[2] + ".get_attribute('" + statement[3] + "')\ntry:\n\t"
                            dotAssert = "assert " + assertVal + " in " + statement[2] + "." + statement[3] + "\nexcept:\n\t"
                            cssAssert = "assert " + assertVal + " in " + statement[2] + ".value_of_css_property('" + statement[3] + "')\n"
                            if 'document' in statement[1] and 'location' in statement[2]:
                                httpCheck = statement[3].split("://")
                                httpCheck[0] = httpCheck[0].strip('\"')
                                httpCheck[0] = httpCheck[0].strip('\'')
                                statement[3] = statement[3].strip('\"')
                                statement[3] = statement[3].strip('\'')
                                if len(httpCheck) == 1:
                                    httpAssert = "assert " + "'http://" + statement[3] + "' in driver.current_url or 'https://" + statement[3] + "' in driver.current_url\n" 
                                elif httpCheck[0] == 'http':
                                    httpCheck[1] = httpCheck[1].strip('\"')
                                    httpCheck[1] = httpCheck[1].strip('\'')
                                    httpAssert = "assert " + "'http://" + httpCheck[1] + "' in driver.current_url\n"
                                elif httpCheck[0] == 'https': 
                                    httpCheck[1] = httpCheck[1].strip('\"')
                                    httpCheck[1] = httpCheck[1].strip('\'')
                                    httpAssert = "assert " + "'https://" + httpCheck[1] + "' in driver.current_url\n"
                                selenium.write(httpAssert)
                            else:
                                selenium.write(statement[2] + " = " + findAssert + "\n")
                                selenium.write(getCheck)
                                selenium.write(getAssert)
                                selenium.write(dotAssert)
                                selenium.write(cssAssert)

                        elif 'document' in statement[0]:
                            if 'scroll' in statement[1]:
                                if 'bottom' in statement[2]:
                                    scrollStatement = "driver.execute_script('window.scrollTo(0, document.body.scrollHeight'))\n"
                                elif ',' in statement[2]:
                                    scrollStatement = "driver.execute_script('window.scrollTo" + statement[2] + "')\n"
                                else: 
                                    findStatement = "driver.find_element_by_id('" + statement[2].strip('()') + "')\n"
                                    selenium.write(statement[2].strip('()') + ' = ' + findStatement)
                                    scrollStatement = statement[2].strip('()') + '.location_once_scrolled_into_view'
                            selenium.write(scrollStatement)

                        elif '(' == statement[1][0] and ')' == statement[1][len(statement[1]) - 1]:
                            findStatement = "driver.find_element_by_id('" + statement[3] + "')\n"
                            selenium.write(statement[3] + ' = ' + findStatement)
                            actionStatement = statement[3] + "." + statement[0] + statement[1]
                            selenium.write(actionStatement + "\n")
                        else:
                            findStatement = "driver.find_element_by_id('" + statement[2] + "')\n"
                            selenium.write(statement[2] + ' = ' + findStatement)
                            actionStatement = statement[2] + "." + statement[0] + "()"
                            selenium.write(actionStatement + "\n")
                selenium.write("driver.save_screenshot('snap" + str(screenshots) + ".png')\n")
                selenium.write("driver.get('"+url+"')\n")
                selenium.write("\n")
            selenium.write("print('tests executed without failures')\n")
            selenium.write("print('" + str(screenshots) + "')")
            # selenium.write("sys.stdout.flush()")

#comment this out when finished testing
# parser = Parser()
# lexer = Lexer.Lexer()
# tokens = lexer.lex("test2.parth")
# print(tokens)
# parser.parse(tokens, "seleniumTest.py")
