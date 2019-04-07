# for checking for compilation/syntax and some runtime errors
# (c) Alex Shukhman 2/28/17

############################################################################

# Info

'''
Build 0.0.0
Notes:
    Don't forget to pip install stuff.
    This is thpipe only not-automated step (everything else should work out the box).

    All servers run on ubuntu-16-04-x32 slug at a size of 512mb.
    That should be more than enough space.
    To work with setup files, use (js)setup.sh. <- will offer different setups per language
    Do not do any server setup directly with Python, only with shell scripts.

    If using new libraries for import, update documentation accordingly.
    To Test Setup:
        1. Create JS file and parth file
        2. Run in Terminal:
            - python (or python3)
            - from pythonBackend import *
            - test(jsFilePath = 'route/to/file.js', pyFilePath = 'route/to/pythonmiddleware.py', parthFilePath = 'route/to/parthfile.parth', verbose = True) <- no attr results in testing of foo.js

    For Build 0.0.0:
        Languages Offered:
            - Javascript
        Build Platforms:
            - .js: Nodejs JS Interpreter
pip: <- if running python3, command is pip3, not pip
    pip install -U python-digitalocean
    pip install -U paramiko
    pip install -U pysendfile
DigitalOcean Python Token:
To SSH to server (requires unix machine or git bash):
    cd path/to/smopapi
    ssh -i key root@[ip] -> ip being the server ip address
'''

############################################################################

# Imports

import os, sys, time, subprocess, socket, digitalocean, paramiko, Lexer, Parser

import testframework # mostly for imports and toDict

from digitalocean import SSHKey

try:
    import simplejson as json
except:
    import json
from subprocess import call

############################################################################

# Globals (minimize use of globals)

global pytoken
pytoken = ''

############################################################################

# Helper Functions

# Destroy Server
def closeServer(d):
    return d.destroy()

# Checks if str is valid javascript file name
def isfiletype(s, blank):
    return "."+blank == s[-1*(len(blank)+1):-1]+s[-1]

# Parse Test Results
def parseout(everything):
    try:
        everything['success'] = 'true'
        # everything['out'] = testframework.unString(everything['out'])
        # failed_tests = []
        # for key in everything['out'].keys():
        #     if everything['out'][key] == 'false': #test if any tests failed
        #         failed_tests.append(key)

        if everything['errors'] != '':
            everything['success'] = 'false'
            # print(everything['errors'])
            errorSections = everything['errors'].split("\n")
            everything['errors'] = "failed " + errorSections[2].strip()

        # if len(failed_tests) == 0:
        #     everything['test_errors'] = ''

        # else:
        #     everything['success'] = 'false'
        #     everything['test_errors'] = 'Tests failed = ' + str(failed_tests)
        #     everything['errors'] = 'Not all unit tests passed. Other Errors:'+everything['errors']

    except Exception as e:
        everything['success'] = 'false'
        everything['errors'] = 'Test Error, please contact the owner of this task'
        everything['test_errors'] = 'Unsuccessful Testing, something may be wrong with the tests'

    return everything

# Read File
def readFile(file):
    with open(file, 'r') as f:
        return f.readlines()

# Read Input From NPM
def readIn():
    lines = json.dumps(sys.stdin.readlines())
    return json.loads(lines)

# Set Up Server and Run JS File
def runSetup(ip, ssh_key, jsFilePath, pyFilePath, py2FilePath, verbose, name, key):
    # connection setup
    connection = paramiko.SSHClient()
    connection.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    if verbose:
        print('picking flowers...')
        # print('server acquired, running commands...')
        sys.stdout.flush()

    # connect -- try a maximum of maxTries times
    maxTries = 12 # hopfully doesn't take more than like 2 or 3
    tries = 0
    success = False
    phrases = ['','this might take a second', 'finding a bunny...', 'going down waterfalls...', 'eating roots...', 'chasing butterflies...', 'finding a rainbow...', 'chasing leprechauns...', 'finding gold...', 'eating squares...', 'finding blue people..', 'looking at mushroom huts', 'building villages']
    while maxTries>tries:
        try:
            tries += 1
            if verbose:
                print(phrases[tries])
                sys.stdout.flush()
            connection.connect(hostname=ip, username='root', key_filename='key', timeout = 10)
            success = True
            break
        except Exception as e:
            # print(e)
            time.sleep(6) # give it a sec or two...

    # if it's just not working...
    if not success:
        return '', 'failed to connect because '+str(e), ip # error

    # send all files including setup and run files
    filelist = [jsFilePath, pyFilePath, py2FilePath]
    for f in filelist:
        try:
            sendToIP(f, ip, verbose)
        except Exception as e:
            return '', 'Error with sending file: ' + str(e), ip # error
    if verbose:
        print('got em!')
        sys.stdout.flush()

    # setup and run on server
    try:
        scommands = readFile('jssetup.sh') # setup commands
    except:
        scommands = readFile('python/jssetup.sh')

    for command in scommands: # silent
        phraseNum = 10
        if verbose:
            print(phrases[phraseNum])
            sys.stdout.flush()
        stdin, stdout, stderr = connection.exec_command(command)
        out = stdout.read().decode("utf-8").strip()
        #print(out)
        #print ("Errors")
        errors = stderr.read().decode("utf-8").strip()
        #print(errors)
        phraseNum -= 1

    testCommand = 'python3 testframework.py' # run commands
    if verbose:
        print('crunching numbers...')
        sys.stdout.flush()
    stdin, stdout, stderr = connection.exec_command(testCommand)
    out = stdout.read().decode("utf-8").strip()

    numScreen = 0
    lines = out.split("\n")
    if len(lines) != 0 and lines[0] != '':
        numScreen = int(lines[1])

    screenshotCommands = []
    for i in range(numScreen):
        screenshotCommands.append("aws s3 cp snap" + str(i + 1) + ".png s3://smop-file-dump/" + key + "/" + name + "/" + "screenshots/snap" + str(i + 1) + ".png")
    
    for command in screenshotCommands:
        stdin, stdout, stderr = connection.exec_command(command)
        if verbose:
            print('taking pictures!')
            sys.stdout.flush()
    # if verbose:
    #     print(out)
    #     sys.stdout.flush()
    # #print ("Errors")
    errors = stderr.read().decode("utf-8").strip()
    connection.close()
    return out, errors, ip

# FTP Local Files
def sendToIP(filename, ip, verbose):
    # set up
    PRIVATEKEY = 'key'
    user = 'root'
    server = ip
    port = 22
    paramiko.util.log_to_file("support_scripts.log")
    trans = paramiko.Transport((server,port))
    rsa_key = paramiko.RSAKey.from_private_key_file(PRIVATEKEY)

    # connect
    trans.connect(username=user, pkey=rsa_key)
    session = trans.open_channel("session")

    # ftp files
    sftp = paramiko.SFTPClient.from_transport(trans)
    if verbose:
        print('testing...')
        sys.stdout.flush()
    if isfiletype(filename, 'js'):
        path = '/root/app.js' # call the script 'app.js'
    elif isfiletype(filename, 'py'):
        path = '/root/testframework.py' # call the test framework 'testframework.py'
    elif isfiletype(filename, 'parth'):
        path = '/root/tests.parth' # call the test file 'tests.parth'
    else:
        path = '/root/'+filename # in root directory
    localpath = './'+filename
    sftp.put(localpath, path)

    # close
    sftp.close()
    trans.close()

# Create Server
def spinupServer(token, ssh_key, verbose): # DO NOT RUN WITHOUT MY PERMISSION, THIS IS A PAID SERVICE, always close server when done
    # ask DigitalOcean.com to provision a server (d for droplet)
    snaps = digitalocean.Manager(token = pytoken).get_my_images()
    d = digitalocean.Droplet(token=pytoken,
                             name='test'+token,
                             region= 'nyc3',
                             image= "ubuntu-16-04-x64", #Ubuntu 16.04.1 x64
                                                 #manager = digitalocean.Manager(token = pytoken)
                                                 #manager.get_all_images()
                             size_slug='1gb',
                             ssh_keys = [ssh_key.id],
                             backups=True)
    d.create()
    while True:
        d.load()
        if d.ip_address!=None:
            print("Bucking up and starting engines...")
            sys.stdout.flush()
            break
    while True:
        if "completed" in str(d.get_actions()[0].status):
            break
    
    if len(snaps) != 0:
        d.rebuild(int(snaps[0].id))
    return d

# Write a File
def writeFileParth(file, name):
    with open(file, "r") as testFile:
        lines = testFile.read()
    with open(name, "w") as f:
        for line in lines:
            f.write(line)

def writeFileApp(lines, name):
    with open(name, "w") as f:
        for line in lines:
            f.write(line)

############################################################################

# Run Functions

def test(jsFilePath='app.js', pyFilePath='seleniumTest.py', py2FilePath='test2.parth', verbose = True, name = '', key = ''):
    # ssh key get -- the key will work with the local files, do /not/ make new ones (aka, no ssh-keygen)
    ssh_key = digitalocean.Manager(token = pytoken).get_all_sshkeys()[0] # there should only be one

    # provision server then set it up and run code
    t0 = time.time()
    d = spinupServer("AJS", ssh_key, verbose)
    out, errors, ip = runSetup(d.ip_address, ssh_key, jsFilePath, pyFilePath, py2FilePath, verbose, name, key)

    '''try:
        raw_input('To close server press ENTER')
    except:
        input('To close server press ENTER')'''

    timeAJS = time.time()-t0
    # input('press enter, ip = '+str(ip))
    # destroy server and print operating cost (usually negligible)
    # playing with snapshots, this works in creating one called test
    # d.power_off()
    # d.take_snapshot("test")
    # d.power_on()
    #print(d.get_snapshots())
    #sys.stdout.flush()
    closeServer(d)
    # print('$'+str(round(.03*timeAJS/60/60,2))) # how much cash you owe me
    return {'out': out,
            'errors': errors}

def main():
    # Read input
    lines = json.loads(readIn()[0])
    commands = []
    print("Submission Received! Going on an adventure...")
    sys.stdout.flush()
    name = lines[2]
    key = lines[3]
    tests = [lines[4]]
    owner = lines[5]
    # print(tests)

    users3key = "smop-file-dump/" + key + "/" + name + "/"
    owners3key = "smop-file-dump/" + key + "/" + owner + "/"

    ownerlist = "aws s3 ls s3://" + owners3key + " --recursive --human-readable > python/owner.txt"
    coderlist = "aws s3 ls s3://" + users3key + " --recursive --human-readable > python/coder.txt"
    os.system(ownerlist)
    os.system(coderlist)

    with open('python/coder.txt', 'r') as coderfiles, open('python/owner.txt', 'r') as ownerfiles:
        coderfiles = coderfiles.read().split("\n")
        ownerfiles = ownerfiles.read().split("\n")
    if len(coderfiles) != len(ownerfiles):
        for i in range(len(ownerfiles)):
            if (ownerfiles[i] != ''):
                filename = ownerfiles[i].split(key + "/" + owner + "/")[1]
                if filename not in coderfiles:
                    addfile = "aws s3 cp s3://smop-file-dump/" + key + "/" + owner + "/" + filename + " s3://smop-file-dump/" + key + "/" + name + "/" + filename + "\n"
                    commands.append(addfile)

    commands.append("aws s3 cp s3://" + users3key + " . --recursive\n") 
    commands.append("screen -d -m php -S localhost:8000")

    writeFileApp(commands, "python/jssetup.sh")

    # tests = ["click button mybutton\n-> span field text 1"]

    writeFileApp(tests, 'python/tests.parth')
    writeFileParth("python/sample.py", "python/seleniumTest.py")
    tester = Lexer.Lexer()
    tokens = tester.lex('python/tests.parth') #change this back to python/test2.parth and then finally to parth file path when working
    # print(tokens)
    sys.stdout.flush()
    parser = Parser.Parser()
    parser.parse(tokens, "python/seleniumTest.py") #change this back to python/seleniumTest.py
    
    everything = test('python/app.js', 'python/seleniumTest.py', 'python/tests.parth', name = name, key = key) #change back and make sure all these files have a python/ before them
    everything = parseout(everything)
    #everything['lines'] = readFile('python/foo.js')

    # Return Using Print
    print(json.dumps(everything))
    sys.stdout.flush()

    return #EOF

# on call, start process
if __name__ == '__main__':
    main()
