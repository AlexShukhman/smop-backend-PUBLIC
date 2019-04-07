import sys
class Lexer:
    def __init__(self):
        self.tokens = []
    def lex(self, file):
        with open(file, 'r') as testfile:
            filestring = testfile.read()
        self.tokens = filestring.split(";")
        if '' in self.tokens:
            self.tokens.remove('')
        for i in range(len(self.tokens)):
            self.tokens[i] = self.tokens[i].strip().split('\n')
        for i in range(len(self.tokens)):
            for j in range(len(self.tokens[i])):
                self.tokens[i][j] = self.tokens[i][j].strip().split()
        return self.tokens

