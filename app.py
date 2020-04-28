import eel

eel.init('web')

print('running app')

@eel.expose
def getEmailPassword(email, password):
    print(email + password)



@eel.expose
def getDashboardBool(x):
    #print(str(x))
    if(x == True):
        print('Dashboard is active')
    else:
        print('Dasboard is deactivated')

@eel.expose
def runScript(val):
    print(val)



my_options = {
    'mode': "chrome-app", #or "chrome-app",
    'host': 'localhost',
    'port': 8080,
    'chromeFlags': ["--start-fullscreen", '--disable-http-cache']
    
}

eel.start('main.html', options=my_options, size=(650, 612))

