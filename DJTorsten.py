from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import os
import time
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
import selenium.webdriver.support.ui as ui
import selenium.webdriver.support.expected_conditions as EC
import firebase_admin
from firebase_admin import credentials, firestore
import google
from pynput.keyboard import Key, Listener
from pynput import keyboard
import sys
from random import seed
from random import randint
import eel

email = 'x'
password = 'xy'

eel.init('web')

print('running app')

@eel.expose
def getEmailPassword(JSemail, JSpassword):
    #print('xxx called...')
    global email
    global password

    email = JSemail
    password = JSpassword
    print('  inside.. ' + email + ' ' + password)
    return email, password



@eel.expose
def getDashboardBool(x):
    print(str(x))
    # if(x == 'true'):
    #     print('Dashboard is active')
    # else:
    #     print('Dasboard is deactivated')

@eel.expose
def runScript(val):
    print(val)



my_options = {
    'mode': "chrome", #or "chrome-app",
    'host': 'localhost',
    'port': 8080,
    'chromeFlags': ["--start-fullscreen", '--disable-http-cache']
    
}



# print('********************************************************************************')
# print('***********************************DJ Torsten***********************************')
# print('********************************************************************************')

# seed(1)

# current = set()


# def on_press(key):
#     print('{0} pressed'.format(
#         key))
#     if key == Key.esc:
#         print('Application Finished')
#         print('© Copyright KidsonX Technolgies LLC, 2020. All Rights Reserved')
#         driver.quit()
#         sys.exit()
#         exit()


# def on_release(key):
#     print('{0} release'.format(
#         key))
#     # if key == Key.esc:
#     #     # Stop listener
#     #     return False


# listener = keyboard.Listener(
#     on_press=on_press,
#     on_release=on_release)
# listener.start()
# print('Listener is turned on')


# cred = credentials.Certificate(os.path.dirname(
#     os.path.realpath(__file__)) + "/ServiceAccountKey.json")
# default_app = firebase_admin.initialize_app(cred)
# db = firestore.client()

# # TODO: Put back inputs
# # email = input('What is your Google username: ')
# # password = input('What is your Google password: ', )


# doc_ref = db.collection(u'songList')


# class Length(object):
#     def __init__(self, length):
#         self.length = length

#     @staticmethod
#     def from_dict(source):
#         # [START_EXCLUDE]
#         length = Length(source[u'length'])

#         return length
#         # [END_EXCLUDE]

#     def to_dict(self):
#         # [START_EXCLUDE]
#         return Length('')
#         dest = {
#             u'length': '',
#         }

#         if self.capital:
#             dest[u'capital'] = self.capital

#         if self.population:
#             dest[u'population'] = self.population

#         if self.regions:
#             dest[u'regions'] = self.regions

#         return dest
#         # [END_EXCLUDE]

#     def __repr__(self):
#         return(
#             u'Length(length={})'
#             .format(self.length))


# class Song(object):
#     def __init__(self, url, name, submitter, artist):
#         self.url = url
#         self.name = name
#         self.submitter = submitter
#         self.artist = artist

#     @staticmethod
#     def from_dict(source):
#         # [START_EXCLUDE]
#         song = Song(source[u'url'], source[u'name'],
#                     source[u'submitter'], source[u'artist'])

#         return song
#         # [END_EXCLUDE]

#     def to_dict(self):
#         # [START_EXCLUDE]
#         return Song('', '', '', '')
#         dest = {
#             u'url': '',
#             u'name': '',
#             u'submitter': ''
#         }

#         if self.capital:
#             dest[u'capital'] = self.capital

#         if self.population:
#             dest[u'population'] = self.population

#         if self.regions:
#             dest[u'regions'] = self.regions

#         return dest
#         # [END_EXCLUDE]

#     def __repr__(self):
#         return(
#             u'Song(url={}, name={}, submitter={}, artist={})'
#             .format(self.url, self.name, self.submitter, self.artist))


# # musicList = ["https://www.youtube.com/watch?v=6Dakd7EIgBE", "https://www.youtube.com/watch?v=0VqTwnAuHws", "https://www.youtube.com/watch?v=QgaTQ5-XfMM",
# #              "https://www.youtube.com/watch?v=BgAlQuqzl8o", "https://www.youtube.com/watch?v=mJ_fkw5j-t0", "https://www.youtube.com/watch?v=5pBjopDymts", "https://www.youtube.com/watch?v=Cgovv8jWETM"]

# musicList = []

# # cmd = input('Which command do you want to run?  ')

# # os.system(cmd)


# dir_path = os.path.dirname(os.path.realpath(__file__))
# chromedriver = dir_path + "/chromedriver"
# os.environ["webdriver.chrome.driver"] = chromedriver
# driver = webdriver.Chrome(executable_path=chromedriver)


# driver.get("http://gmail.com")

# driver.find_element_by_id("identifierId").send_keys(email)
# driver.find_element_by_id("identifierNext").click()
# time.sleep(5)
# driver.find_element_by_name("password").send_keys(password)
# driver.find_element_by_id("passwordNext").click()
# time.sleep(5)

# oldLength = -1
# nowPlayingDoc = db.collection(u'metadata').document(u'nowPlaying')
# nowPlayingDoc.set({
#     u'songIndex': -1
# })

# while True:

#     currentUrlLoading = oldLength + 1
#     length_doc = db.collection(u'metadata').document(u'listLength').get()
#     OBlength = Length.from_dict(length_doc.to_dict())
#     randomIndex = -1000

#     if OBlength.length == oldLength:
#         print ('List empty. Playing a random song..')
#         randomSong = randint(0, OBlength.length)
#         randomIndex = randomSong
#         try:
#             doc = doc_ref.document(str(randomSong)).get()
#             print(u'Document data: {}'.format(doc.to_dict()))

#         except google.cloud.exceptions.NotFound:
#             print(u'there is no such thing you idiot')

#         song = Song.from_dict(doc.to_dict())
#         musicList.append(song.url)
#     else:
#         while currentUrlLoading <= OBlength.length:
#             try:
#                 doc = doc_ref.document(str(currentUrlLoading)).get()
#                 print(u'Document data: {}'.format(doc.to_dict()))

#             except google.cloud.exceptions.NotFound:
#                 print(u'there is no such thing you idiot')

#             song = Song.from_dict(doc.to_dict())
#             musicList.append(song.url)

#             currentUrlLoading = currentUrlLoading + 1

    

#     i = 0
#     while i < len(musicList):
        
#         driver.get(musicList[i])
#         nowPlaying = oldLength + i + 1
#         if (randomIndex != -1000):
#           nowPlaying = randomIndex
#         nowPlayingDoc.set({
#             u'songIndex': nowPlaying
#         })
#         time.sleep(30)
#         i = i+1
        

#     randomIndex = -1000
#     oldLength = OBlength.length
#     musicList.clear()

# driver.quit()

eel.start('main.html', options=my_options, size=(650, 612), block=False, suppress_error=True)

eel.sleep(20)

while True:
    print(email + ' ' + password)
    eel.sleep(2)


print('Application Finished')
print('© Copyright KidsonX Technolgies LLC, 2020. All Rights Reserved')
