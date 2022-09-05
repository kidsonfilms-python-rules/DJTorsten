// Modules to control application life and create native browser window
const electron = require('electron')
const { app, BrowserWindow, ipcMain, crashReporter } = electron
const path = require('path')
const { default: Canary } = require('./Canary')
// const { default: isExplicit } = require('./Canary/explicitEngine.js')
const http = require('http')
const rpc = require("discord-rpc");
var rpcClient = null;
var canary = null;


let server;
server = http.createServer((req, res) => {
    const filePath = path.join(app.getAppPath(), req.url);
    const file = fs.readFileSync(filePath);
    res.end(file.toString());
    if (req.url.includes('index.js'))
        server.close();
}).listen(8080);

var canaryWindow = null
var mainWindow = null;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            // devTools: false
        },
        icon: `${__dirname}/assets/DJFlame Logo.svg`
    })
    // mainWindow.removeMenu()
    if (process.platform != 'darwin') {
        mainWindow.maximize()
    }
    // and load the index.html of the app.
    mainWindow.loadFile('loading.html').then(() => {
        mainWindow.show()
    })

    mainWindow.on('close', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

function createCanaryWindow() {
    canaryWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        show: false,
        closable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            // devTools: false
        },
        icon: `${__dirname}/assets/DJFlame Logo.svg`
    })
    canaryWindow.loadURL('http://localhost:8080/windows/canary.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    await createWindow()
    await createCanaryWindow()

    if (process.platform == "win32") {
        electron.Menu.setApplicationMenu(null)
    }

    canaryWindow.webContents.on('did-finish-load', function () {
        console.log('[CANARY] Loading Engine...')
        rpcClient = new rpc.Client({ transport: 'ipc' });
        canary = new Canary(canaryWindow.webContents, rpcClient, eventEmitter, mainWindow.webContents)
        canaryWindow.webContents.session.webRequest.onHeadersReceived({ urls: ["*://*/*"] },
            (d, c) => {
                if (d.responseHeaders['X-Frame-Options']) {
                    delete d.responseHeaders['X-Frame-Options'];
                } else if (d.responseHeaders['x-frame-options']) {
                    delete d.responseHeaders['x-frame-options'];
                }

                c({ cancel: false, responseHeaders: d.responseHeaders });
            }
        );
    })

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// Destroy Canary Engine before quitting
app.on('before-quit', () => {
    canaryWindow.destroy()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('gpAddSong', (e, songList) => {
    console.log(songList)
    gpAddDb(songList)
})



//--------------------
// APP
//--------------------
//
//--------------------
// Import All Packages
//--------------------
// General Packages
const Config = require('electron-store');
const { autoUpdater } = require("electron-updater");
//--------------------
// Guest Picks Packages
var Soundplayer = require('play-sound')(opts = {})
// const ytdl = require('youtube-mp3-downloader');
const fs = require('fs')
const EventEmitter = require('events');
const yts = require('yt-search')


//--------------------
// CODE
//--------------------
//
// GENERAL

var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
require("firebase/analytics");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyAVbMdmYayQf8VKDW3j7s-993e4cVzgcHE",
    authDomain: "project-djtorsten.firebaseapp.com",
    databaseURL: "https://project-djtorsten.firebaseio.com",
    projectId: "project-djtorsten",
    storageBucket: "project-djtorsten.appspot.com",
    messagingSenderId: "125871844285",
    appId: "1:125871844285:web:a3009613a9e018449980d4",
    measurementId: "G-CPTEQHPWMT"
};
// // Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
var db = firebase.firestore();

const config = new Config()
var partyID = ''

config.set('devSaveDB', false)
if (config.get('devSaveDB')) {
    config.set('signInInfo', false)
}

function isDev() {
    return process.main.filename.indexOf('app.asar') === -1;
}

// if (isDev()) config.set('devSaveDB', true)

if (process.platform == 'darwin') {
    if (!fs.existsSync(`${__dirname}/music/`)) {
        fs.mkdir(`${__dirname}/music/`);
    }
} else if (process.platform == 'win32' || process.platform == 'linux') {
    if (!fs.existsSync(`${app.getPath('appData')}/.djflame/music/`)) {
        if (!fs.existsSync(`${app.getPath('appData')}/.djflame/`)) {
            fs.mkdir(`${app.getPath('appData')}/.djflame/`).then(() => fs.mkdir(`${app.getPath('appData')}/.djflame/music/`));
        } else {
            fs.mkdir(`${app.getPath('appData')}/.djflame/music/`);
        }
    }
}

ipcMain.on('emailAuth', (e, data) => {
    firebase.auth().signInWithEmailAndPassword(data.email, data.pass)
        .then((userCredential) => {
            console.log('signed in lol')
            var user = userCredential.user;
            config.set('user', user)
            config.set('signInInfo', {
                email: data.email,
                pass: data.pass
            })
            mainWindow.webContents.send('signInSuccess')
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`${errorCode}: ${errorMessage}`)
            if (errorCode == 'auth/invalid-email') {
                mainWindow.webContents.send('auth/invalidEmail')
            } else if (errorCode == 'auth/user-not-found') {
                mainWindow.webContents.send('auth/userNotFound')
            } else if (errorCode == 'auth/wrong-password') {
                mainWindow.webContents.send('auth/wrongPassword')
            } else {
                mainWindow.webContents.send('auth/unknownError')
            }
        });
})

ipcMain.on('attemptAutoSignIn', () => {
    if (config.get('signInInfo')) {
        var data = config.get('signInInfo')
        firebase.auth().signInWithEmailAndPassword(data.email, data.pass)
            .then((userCredential) => {
                console.log('signed in lol')
                var user = userCredential.user;
                config.set('user', user)
                config.set('signInInfo', {
                    email: data.email,
                    pass: data.pass
                })
                mainWindow.webContents.send('signInSuccess')
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(`${errorCode}: ${errorMessage}`)
            });
    } else {
        mainWindow.webContents.send('signInFail')
    }
})

var checkedForUpdates = false
autoUpdater.setFeedURL({
    provider: "github",
    owner: "kidsonfilms-python-rules",
    repo: 'DJFlame-Releases'
})

ipcMain.on('checkForUpdates', () => {
    console.log('checking...')
    autoUpdater.checkForUpdates();
})


// /*checking for updates*/
autoUpdater.on("checking-for-update", () => {
    console.log('Checking for an Update')
    mainWindow.webContents.send('checkingForUpdates')
});

// /*No updates available*/
autoUpdater.on("update-not-available", info => {
    console.log('DJFlame up-to-date!')
    checkedForUpdates = true
    mainWindow.webContents.send('noUpdateAvailable')
});

/*New Update Available*/
autoUpdater.on("update-available", info => {
    console.log(`Update Available! info: ${info}`)
    checkedForUpdates = true
    mainWindow.webContents.send('updateAvailable', info)
});

/*Download Status Report*/
autoUpdater.on("download-progress", progressObj => {
    console.log(`Download Progress: ${progressObj}`)
    mainWindow.webContents.send('updateDownloadProgress', progressObj)
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", info => {
    console.log('Download Finished!')
    mainWindow.webContents.send('updateDownloadFinished')
    autoUpdater.quitAndInstall()
});

// config.set('partyCode', partyID)
ipcMain.on('joinLastParty', () => {
    if (config.get('partyCode')) {
        mainWindow.webContents.send('joinLastPartyCallback', true)
        partyID = config.get('partyCode')
        getSceneSettings()
    } else {
        mainWindow.webContents.send('joinLastPartyCallback', false)
    }
})

function initLogDir() {
    var logdir = path.join(app.getPath('userData'), 'Party Logs/');

    if (!fs.existsSync(logdir)) {
        fs.mkdirSync(logdir);
    }

    var partyLogDir = path.join(logdir, 'party-' + partyID.toString() + '-logs/')
    console.log(partyLogDir)

    if (!fs.existsSync(partyLogDir)) {
        fs.mkdirSync(partyLogDir)
    }

    const user = config.get('user')
    const os = require('os')

    if (!fs.existsSync(path.join(partyLogDir, 'party-config-log.json'))) {
        var partyConfigLog = {
            partyID: partyID,
            partyLogCreationDate: new Date(),
            partySettingsRevisions: 0,
            user: {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                lastLoginDate: user.lastLoginAt,
                userCreationDate: user.createdAt
            },
            djflameVersion: require('./package.json').version,
            systemInfo: {
                clientOS: os.platform(),
                clientOSVersion: os.version(),
                clientOSArch: os.arch(),
                clientCPUCores: os.cpus().length,
                clientCPUInfo: os.cpus(),
                clientTotalMem: os.totalmem(),
            },
            systemSoftwareInfo: {
                nodeVersion: process.version,
                chromeVersion: process.versions['chrome'],
                electronVersion: process.versions.electron
            }
        }
        var partyConfigLogStr = JSON.stringify(partyConfigLog)
        fs.writeFileSync(path.join(partyLogDir, 'party-config-log.json'), partyConfigLogStr, 'utf8');
    }

    if (!fs.existsSync(path.join(partyLogDir, 'party-events.log'))) {
        fs.writeFileSync(path.join(partyLogDir, 'party-events.log'), '[' + new Date().toISOString() + '] LOG START')
    }
    // if (!fs.existsSync(path.join(partyLogDir, 'node-errors.log'))) {
    const error = fs.createWriteStream(partyLogDir + '/node.error.log', { flags: 'a' });
    // if (process.platform == "darwin") {
    //     process.stderr.pipe(error);
    // }
    // }
    if (!fs.existsSync(path.join(partyLogDir, 'crash-dumps/'))) {
        fs.mkdirSync(path.join(partyLogDir, 'crash-dumps/'))
    }

    app.setPath('crashDumps', path.join(partyLogDir, 'crash-dumps/'))
    crashReporter.start({ uploadToServer: false })
}

function partylog(message, error = false, thread = 'MAIN') {
    const log = `${error ? '\n\n----------------------ERROR THROWN----------------------' : ''}\n[${new Date().toISOString()}] [${thread}]${(error ? ' [ERROR]' : '')} ${message}${error ? '\n----------------------ERROR END----------------------\n' : ''}`
    console.log(log.replace('\n', ''))
    fs.open(path.join(path.join(path.join(app.getPath('userData'), 'Party Logs/'), 'party-' + partyID.toString() + '-logs/'), 'party-events.log'), 'a', 666, function (e, id) {

        fs.write(id, log, null, 'utf8', function () {
            fs.close(id, function () {
            });
        });
    });
}

process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
    partylog(reason + 'Unhandled Rejection at Promise' + p, true)
})
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        partylog(err + 'Uncaught Exception thrown', true)
        process.exit(1);
    });

function getSceneSettings() {
    if (!config.get('devSaveDB')) {
        db.collection('parties').doc(partyID).get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
                partylog("Document data:" + doc.data())
                var data = doc.data()
                config.set('sceneSettings', {
                    general: {
                        guestPicks: data.guestPicks,
                        karaoke: data.karaoke
                    },
                    guestPicks: {
                        externalDisplay: data.guestPicksExternalDisplay,
                        songLength: {
                            random: data.guestPicksSongLenRandom,
                            range1: data.guestPicksSongLenRange1,
                            range2: data.guestPicksSongLenRange2,
                        },
                        gpPlayAfter: data.gpAfterSong
                    }
                })
                console.log(config.get('sceneSettings'))
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            partylog("Error getting document: " + error, true)
            console.log("Error getting document:", error);
        });
        initLogDir()
        partylog('Joined ' + partyID + ' Party')
        partylog('Found Scene Settings')
    } else {
        console.log('Entering Developer Database Saving Mode...')
        partylog('Entering Developer Database Saving Mode...')
        config.set('sceneSettings', {
            general: {
                guestPicks: true,
                karaoke: false
            },
            guestPicks: {
                externalDisplay: true,
                songLength: {
                    random: true,
                    range1: 22,
                    range2: 44,
                }
            }
        })
    }
}

ipcMain.on('sceneSettingsChange', (e, data) => {
    // console.log(data)
    partylog('Scene Settings Changed')
    config.set('sceneSettings', data)
    db.collection('parties').doc(partyID).set({
        guestPicks: data.general.guestPicks,
        guestPicksExternalDisplay: data.guestPicks.externalDisplay,
        guestPicksSongLenRandom: data.guestPicks.songLength.random,
        guestPicksSongLenRange1: data.guestPicks.songLength.range1,
        guestPicksSongLenRange2: data.guestPicks.songLength.range2,
        karaoke: data.general.karaoke
    }, { merge: true })
})

ipcMain.on('requestSceneSettings', () => {
    mainWindow.webContents.send('requestedSceneSettings', config.get('sceneSettings'))
})

ipcMain.on('createNewParty', () => {
    const userUID = config.get('user').uid
    db.collection('users').doc(userUID).get().then((udata) => {
        if (udata.data().partiesLeft > 0 || udata.data().role == 'ADMIN') {
            var min = 100000;
            var max = 999999;
            const partyCodeGen = (Math.floor(Math.random() * (max - min + 1)) + min).toString();
            console.log(partyCodeGen)
            db.collection("parties").doc(partyCodeGen).set({
                creator: userUID,
                gpCurrentDocName: 0,
                gpNowPlaying: -1,
                guestPicks: false,
                guestPicksExternalDisplay: false,
                guestPicksSongLenRandom: true,
                guestPicksSongLenRange1: 22,
                guestPicksSongLenRange2: 44,
                karaoke: false
            }).then(() => {
                console.log('Created root party collection!')
                db.collection("parties").doc(partyCodeGen).collection("guestPicks").doc("0").set({
                    url: 'https://music.youtube.com/watch?v=cnRB2CgUpSw&list=RDCLAK5uy_mzpBFnAPcGS-4FYm4BzAY-Q3VmvNCQwxY',
                    submitter: 'DJ'
                }).then(() => {
                    console.log('Created Party...')
                    partyID = partyCodeGen
                    getSceneSettings()
                    db.runTransaction((transaction) => {
                        // This code may get re-run multiple times if there are conflicts.
                        return transaction.get(db.collection('users').doc(userUID)).then((uDoc) => {
                            if (!uDoc.exists) {
                                throw "Document does not exist!";
                            }
                            var newPartiesLeft = uDoc.data().partiesLeft - 1;
                            transaction.update(db.collection('users').doc(userUID), { partiesLeft: newPartiesLeft }, { merge: true });
                        });
                    }).then(() => {
                        console.log("Transaction successfully committed!");
                    }).catch((error) => {
                        console.log("Transaction failed: ", error);
                    });
                    config.set('partyCode', partyID)
                    mainWindow.webContents.send('createNewPartyCallback')
                })
            })
        } else {
            // alert('You have used up all your parties this month, contact us if you think this is a mistake.')
            console.log(data.data().partiesLeft)
            console.log(userUID)
            console.log(data.data())
            mainWindow.webContents.send('noPartiesLeft')
        }
    })
})

ipcMain.on('requestPartyCode', () => {
    mainWindow.webContents.send('requestedPartyCode', partyID)
})

ipcMain.on('enterDeveloperMode', () => {
    partyID = '053467'
    getSceneSettings()
    partylog('Entered Developer Mode')
    mainWindow.loadFile('./index.html')
})

if (!Array.isArray(config.get('heartSongs'))) {
    config.set('heartSongs', [])
}

// ----------------------------
// GUEST PICKS
// ----------------------------

class Song {
    constructor(url, probarDiv, docName, title, author, thumbnail, requester, explicit) {
        this.url = url
        this.progressDiv = probarDiv
        this.docName = docName
        this.title = title
        this.author = author
        this.thumbnail = thumbnail
        this.requester = requester
        this.explicit = explicit
    }
}

class DownloadSong {
    constructor(url, i, name, thumbnail, author) {
        this.url = url;
        this.i = i;
        this.name = name;
        this.thumbnail = thumbnail;
        this.author = author
    }
}

var q = Array(Song);
q.pop();
var downloadedq = [];
var status = 'STOPPED'
var eventEmitter = new EventEmitter();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function arrayContains(needle, haystack) {
    return (haystack.indexOf(needle));
}

async function gpAdd(url, docName, title = "", author = "") {
    console.info(`Adding ${url} to Playing Queue...`)
    partylog('Added New Song to Local Queue, URL: ' + url)
    if (url.toLowerCase().includes('youtube.com')) {
        var vidRaw = `?${url.split('?')[1]}`
        var v = new URLSearchParams(vidRaw).get('v');
        var videoInfo = await yts({ videoId: v })
        // q.push(new Song(url, '', docName, videoInfo.title, videoInfo.author.name, 'DJ'))
        // q.sort(function (a, b) {
        //     return parseInt(a.docName) - parseInt(b.docName);
        // })
        var isEx = false
        // if (!url.toLowerCase().includes('1yYV9-KoSUM')) {
        //     isEx = await isExplicit(new Song(url, '', docName, videoInfo.title, videoInfo.author.name, videoInfo.thumbnail, 'DJ', false)).catch((err) => partylog(err, true))
        // }
        canary.add(new Song(url, '', docName, videoInfo.title, videoInfo.author.name, videoInfo.thumbnail, 'DJ', isEx))
        canary.queue.sort(function (a, b) {
            return parseInt(a.docName) - parseInt(b.docName);
        })
        // console.log(canary.queue)
        if (isEx) {
            console.log('New Song ' + videoInfo.title + ' Explicit!')
        }
        mainWindow.webContents.send('gpAdd', { url, docName, explicit: isEx })
    } else {
        canary.add(new Song(url, '', docName, title, author, 'https://player.listenlive.co/templates/StandardPlayerV4/webroot/img/default-cover-art.png', 'DJ', false))
        canary.queue.sort(function (a, b) {
            return parseInt(a.docName) - parseInt(b.docName);
        })
        mainWindow.webContents.send('gpAdd', { url, docName, explicit: false, title: title, author: author })
    }
}

ipcMain.on('gpAdd', (event, data) => {
    gpAdd(data.url, data.docName)
})

function gpAddDb(songList) {
    partylog(`Added New Song${(songList.length > 1) ? 's' : ''} to Database Queue, URL${(songList.length > 1) ? 's' : ''}: ${songList}`)
    if (config.get('devSaveDB')) {
        songList.forEach((s) => {
            gpAdd(s, q.length + 4)
        })
    } else {
        songList.forEach((s, i) => {
            console.log(s)
            var title = ""
            const payload = {
                url: s,
                submitter: "DJ",
            }
            if (!s.toLowerCase().includes('youtube.com')) {
                title = path.basename(s).split('.')[0]
                payload.title = title
                payload.artist = 'Unknown'
            }
            db.collection('parties').doc(partyID).get().then((doc) => {
                db.collection('parties').doc(partyID).collection('guestPicks').doc((doc.data().gpCurrentDocName + 1).toString()).set(payload)
                    .then(function () {
                        console.log("Document successfully written!");
                        partylog(`Song Document ${s} Succesfully Written`)
                        db.collection('parties').doc(partyID).update({
                            gpCurrentDocName: firebase.firestore.FieldValue.increment(1)
                        });
                        sleep(1000)
                    })
                    .catch(function (error) {
                        console.error("Error writing document: ", error);
                        partylog("Error writing document: " + error, true)
                    });
            })
        })
    }
}

async function gpPlay(time, index, currentI) {
    // if (downloadedq.length - 1 < index) return Error('Did not download requested song index')
    console.info(`Playing ${index}.mp3...`)
    return new Promise(async (resolve) => {
        db.collection('parties').doc(partyID).set({
            gpNowPlaying: currentI
        }, { merge: true })
        var dirPathMusic = `${__dirname}/music`
        if (process.platform == 'win32' || process.platform == 'linux') dirPathMusic = `${app.getPath('appData')}/.djflame/music`
        var songInstance = Soundplayer.play(`${dirPathMusic}/${index}.mp3`, function (err) {
            if (err) console.error(err);
            console.log("Audio finished");
            resolve()
        });


        if (win) {
            var result = downloadedq.filter(obj => {
                return obj.i === index
            })
            console.log(result)
            if (q.length - (currentI + 1) < 4) {
                var queueList = []
                for (var i = currentI + 1; (q.length - i) > 0; i++) {
                    queueList.push({
                        title: q[i].title,
                        author: q[i].author,
                        requester: "DJ"
                    })
                    console.log(queueList)
                }
                console.log(queueList)
                data = {
                    nowPlaying: {
                        title: result[0].name,
                        author: q[currentI].author,
                        thumbnail: result[0].thumbnail.split('?')[0],
                        requester: "DJ",
                        likes: "0"
                    },
                    queue: queueList
                }
            } else {
                data = {
                    nowPlaying: {
                        title: result[0].name,
                        author: q[currentI].author,
                        thumbnail: result[0].thumbnail.split('?')[0],
                        requester: "DJ",
                        likes: "0"
                    },
                    queue: [
                        {
                            title: q[currentI + 1].title,
                            author: q[currentI + 1].author,
                            requester: "DJ"
                        },
                        {
                            title: q[currentI + 2].title,
                            author: q[currentI + 2].author,
                            requester: "DJ"
                        },
                        {
                            title: q[currentI + 3].title,
                            author: q[currentI + 3].author,
                            requester: "DJ"
                        },
                        {
                            title: q[currentI + 4].title,
                            author: q[currentI + 4].author,
                            requester: "DJ"
                        },
                    ]
                }
            }
            win.webContents.send('newExternalDisplayData', data)
        }

        eventEmitter.on('stop', () => {
            songInstance.kill()
            resolve()
        })
        eventEmitter.on('skip', () => {
            songInstance.kill()
            resolve()
        })

        setTimeout(function () {
            songInstance.kill()
            return 0
        }, time * 1000);
    })
}

async function canaryPlay(song, songLen, index) {
    return new Promise(async (resolve, reject) => {
        db.collection('parties').doc(partyID).set({
            gpNowPlaying: index
        }, { merge: true })
        if (song.url.toLowerCase().includes('youtube.com')) {
            canary.play(song, songLen, index).then(() => {
                resolve()
            })
        } else {
            canary.playLocal(song, songLen, index).then(() => {
                resolve()
            })
        }
        mainWindow.webContents.send('canaryNewSong')

        if (win) {
            // var result = downloadedq.filter(obj => {
            //     return obj.i === index
            // })
            // console.log(result)
            const q = canary.queue
            if (q.length - (index + 1) < 4) {
                var queueList = []
                for (var i = index + 1; (q.length - i) > 0; i++) {
                    queueList.push({
                        title: q[i].title,
                        author: q[i].author,
                        requester: q[i].requester
                    })
                    console.log(queueList)
                }
                console.log(queueList)
                data = {
                    nowPlaying: {
                        title: q[index].title,
                        author: q[index].author,
                        thumbnail: q[index].thumbnail.split('?')[0],
                        requester: q[index].requester,
                        likes: "0"
                    },
                    queue: queueList,
                    songsLeft: q.length - index - 1
                }
            } else {
                data = {
                    nowPlaying: {
                        title: q[index].title,
                        author: q[index].author,
                        thumbnail: q[index].thumbnail.split('?')[0],
                        requester: q[index].requester,
                        likes: "0"
                    },
                    queue: [
                        {
                            title: q[index + 1].title,
                            author: q[index + 1].author,
                            requester: q[index + 1].requester
                        },
                        {
                            title: q[index + 2].title,
                            author: q[index + 2].author,
                            requester: q[index + 2].requester
                        },
                        {
                            title: q[index + 3].title,
                            author: q[index + 3].author,
                            requester: q[index + 3].requester
                        },
                        {
                            title: q[index + 4].title,
                            author: q[index + 4].author,
                            requester: q[index + 4].requester
                        },
                    ],
                    songsLeft: q.length - index
                }
            }
            win.webContents.send('newExternalDisplayData', data)
        }
    })
}

// async function gpDownload(link, index) {
//     if (downloadedq.map(a => a.url).includes(link)) {
//         var linkMap = await downloadedq.map(a => a.url)
//         var cachei = await arrayContains(link, linkMap)
//         eventEmitter.emit(`downloadFinished ${index}`, downloadedq[cachei].i);
//         return 'Already Downloaded'
//     }
//     console.info(`Downloading ${link}, index ${index}...`)
//     const probar = q[index].progressDiv
//     var vidRaw = `?${link.split('?')[1]}`
//     var v = new URLSearchParams(vidRaw).get('v');
//     const ffmpegPath = isDev() ? `${__dirname}/assets/ffmpeg/ffmpeg` : `${__dirname}/../app.asar.unpacked/assets/ffmpeg/ffmpeg`
//     const outPath = (process.platform == 'win32' || process.platform == 'linux') ? `${app.getPath('appData')}/.djflame/music/` : `${__dirname}/music/`
//     const DOWNLOADER = new ytdl({
//         "ffmpegPath": ffmpegPath, // || FFmpeg binary location
//         "outputPath": outPath, //  || Output file location (default: the home directory)
//         "youtubeVideoQuality": "highestaudio", //   || Desired video quality (default: highestaudio
//         "progressTimeout": 0, //    || Interval in ms for the progress reports (default: 1000)
//     });
//     DOWNLOADER.on("progress", function (progress) {
//         console.log(JSON.stringify(progress));
//         mainWindow.webContents.send('setProbarWidth', { link: link, width: progress.progress.percentage.toString().split('.')[0] })
//         // probar.style.width = `${progress.progress.percentage.toString().split('.')[0]}%`
//     });
//     DOWNLOADER.download(v, `${index}.mp3`)
//     DOWNLOADER.on("finished", function (err, data) {
//         DOWNLOADER.removeAllListeners("progress")
//         if (err) console.error(err)
//         mainWindow.webContents.send('setProbarWidth', { link: link, width: "0" })
//         console.info('Downloaded: \n', JSON.stringify(data));
//         downloadedq.push(new DownloadSong(link, index, data.title, data.thumbnail, data.artist))
//         eventEmitter.emit(`downloadFinished ${index}`, index);
//     });
// }

async function gpStart() {
    if (status == 'STARTED') { console.error('Already Started'); return '' }
    console.info('Starting...')
    partylog('Starting GP Scene. Entered Mode: Button')
    eventEmitter.on('stop', () => {
        console.info('Stopping...')
        partylog('Stopping GP Scene. Exit Cause: DJ')
        status = 'STOPPED'
        q = []
        downloadedq = []
        console.log(q)
        console.log(downloadedq)
        return 'Stopped by DJ';
    })
    status = 'STARTED'
    // await gpAdd('https://www.youtube.com/watch?v=LY39km8rkWY&list=PL2L0EVHlfS_LgbikIUg3O6rJ6b-T0EPjq&index=3')
    // await gpAdd('https://www.youtube.com/watch?v=w0AOGeqOnFY')
    // await gpAdd('https://www.youtube.com/watch?v=LDU_Txk06tM')
    var downloadingStatus = "WAITING"
    var index = 0;
    launchExternalDisplay()
    // for (index = 0; index < q.length; index++) {
    var gpPlayAfter = config.get('sceneSettings').guestPicks.gpPlayAfter
    while (true) {
        if (status != 'STARTED') {
            console.info('Stopped Status, Stopping Function.')
            partylog('Stopping Function Since GP has Stopped')
            return 'Stopped by DJ';
        }
        if (index < canary.queue.length) {
            await gpMain(index, downloadingStatus).then(() => {
                console.log('Song Done!')
                index = index + 1
            })
        } else {
            // if (gpPlayAfter == 0) {
            //     await sleep(1000)
            // } else if (gpPlayAfter == 1) {
            console.log('Picking Random Song!')
            partylog('Picking Random Song Since No Songs Left in Queue')
            await gpMain(Math.floor(Math.random() * canary.queue.length), downloadingStatus).then(() => {
                console.log('Song Done!')
            })
            // }
        }
    }
}

ipcMain.on('gpStart', () => gpStart())

async function gpMain(index, downloadingStatus) {
    if (status != 'STARTED') {
        console.error('Status: STOPPED')
        partylog('Stopping Function Since GP has Stopped')
        return 'Stopped by DJ';
    }
    return new Promise(async (resolve) => {
        eventEmitter.on('stop', () => {
            db.collection('parties').doc(partyID).set({
                gpNowPlaying: -1
            }, { merge: true })
            resolve();
            return 'Stopped by DJ';
        })
        var sceneSetting = config.get('sceneSettings')
        var songLength = 40
        if (sceneSetting.guestPicks.songLength.random) {
            songLength = await Math.floor(Math.random() * (sceneSetting.guestPicks.songLength.range2 - sceneSetting.guestPicks.songLength.range1 + 1) + sceneSetting.guestPicks.songLength.range1);
        } else {
            songLength = await sceneSetting.guestPicks.songLength.range1
        }
        console.log('playing for ', songLength, ' seconds')
        partylog('Playing Song for ' + songLength + ' seconds')

        canaryPlay(canary.queue[index], songLength, index).then(() => {
            resolve()
        })
        // resolve('Done')
        // downloadingStatus = "DOWNLOADING"
        // gpDownload(q[index].url, index)
        // eventEmitter.on(`downloadFinished ${index}`, async (i) => {
        //     downloadingStatus = "PLAYING"
        //     console.log(`Playing Index ${index}, From ${i}`)
        //     await gpPlay(songLength, i, index)
        //     resolve('Done')
        // })
    })
}

ipcMain.on('canaryPlayTime', (e, d) => {
    // console.log(d)
    mainWindow.webContents.send('canaryTimeChange', d)
})

ipcMain.on('canaryChangePlayHead', (e, d) => {
    canaryWindow.webContents.send('canaryChangePlayHead', d)
})
ipcMain.on('canaryPlay', () => {
    canaryWindow.webContents.send('canaryControllerPlay')
})
ipcMain.on('canaryPause', () => {
    canaryWindow.webContents.send('canaryPause')
})
ipcMain.on('canarySkip', () => {
    canaryWindow.webContents.send('canarySkip')
})
ipcMain.on('canaryMute', (e, d) => {
    canaryWindow.webContents.send('canaryMute', d)
})
ipcMain.on('canaryHeartSong', async (e, d) => {
    var favSongs = await config.get('heartSongs')
    if (favSongs.includes(d)) {
        console.log('Removing new Fav Song')
        config.set('heartSongs', favSongs.filter(e => e !== d))
        console.log(config.get('heartSongs'))
        partylog('Removed Favorite Song ' + d)
    } else {
        console.log('Setting new Fav Song')
        favSongs.push(d)
        config.set('heartSongs', favSongs)
        console.log(config.get('heartSongs'))
        partylog('Set New Favorite Song ' + d)
    }
})


function stop() {
    eventEmitter.emit('stop', "Event occurred");
}

ipcMain.on('stop', () => stop())

function skip() {
    eventEmitter.emit('skip', "Event occurred");
}
ipcMain.on('skip', () => skip())

var choiceExternalDisplay = null

ipcMain.on('choiceExternalDisplay', (e, d) => {
    console.log(d)
    partylog(`Set new External Display, Raw Data: ${d}`)
    choiceExternalDisplay = d
})

var win = null

function launchExternalDisplay() {
    if (win) {
        win.close()
        win = null
    }
    if (choiceExternalDisplay) {
        partylog('Launching New External Display Window')
        var d = choiceExternalDisplay
        var dchoice = '2'
        let displays = electron.screen.getAllDisplays()
        let externalDisplay = displays.find((display) => {
            console.log(display, ": ", display.id, "  ", d)
            return display.id == d
        })
        const { width, height } = externalDisplay.workAreaSize
        win = new BrowserWindow({
            width: width,
            height: height,
            x: externalDisplay.workArea.x,
            y: externalDisplay.workArea.y,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false,
                devTools: true
            }
        })
        win.setKiosk(true);
        win.loadFile(`${__dirname}/windows/externalDisplaysGP/externalDisplayGP${dchoice}.html`)
        win.show()
        win.webContents.on('did-finish-load', () => {
            const q = canary.queue
            if (q.length - (0 + 1) < 4) {
                var queueList = []
                for (var i = 0 + 1; (q.length - i) > 0; i++) {
                    queueList.push({
                        title: q[i].title,
                        author: q[i].author,
                        requester: q[i].requester
                    })
                    console.log(queueList)
                }
                console.log(queueList)
                data = {
                    nowPlaying: {
                        title: q[0].title,
                        author: q[0].author,
                        thumbnail: q[0].thumbnail.split('?')[0],
                        requester: q[0].requester,
                        likes: "0"
                    },
                    queue: queueList,
                    songsLeft: q.length - 1
                }
            } else {
                data = {
                    nowPlaying: {
                        title: q[0].title,
                        author: q[0].author,
                        thumbnail: q[0].thumbnail.split('?')[0],
                        requester: q[0].requester,
                        likes: "0"
                    },
                    queue: [
                        {
                            title: q[1].title,
                            author: q[1].author,
                            requester: q[1].requester
                        },
                        {
                            title: q[2].title,
                            author: q[2].author,
                            requester: q[2].requester
                        },
                        {
                            title: q[3].title,
                            author: q[3].author,
                            requester: q[3].requester
                        },
                        {
                            title: q[4].title,
                            author: q[4].author,
                            requester: q[4].requester
                        },
                    ],
                    songsLeft: q.length
                }
            }
            win.webContents.send('newExternalDisplayData', data)
        })

        ipcMain.on('stop', () => {
            if (win != null) {
                win.setKiosk(false);
                win.close()
                win = null
            }
        })

        ipcMain.on('requestPartyCodeExDisplay', () => {
            partylog('External Display Requested Party ID, Sent ' + partyID)
            win.webContents.send('requestedPartyCode', partyID)
        })

        win.on('close', () => { win = null; partylog('Closed External Display Window') })
    }
}

ipcMain.on('launchExternalDisplay', () => launchExternalDisplay())
ipcMain.on('newExternalDisplayDataTest', () => {
    data = {
        nowPlaying: {
            title: "Mombasa",
            author: "2CELLOS",
            thumbnail: "https://i.ytimg.com/vi/VZbwZlNEeew/hq720.jpg",
            requester: "DJ",
            likes: "0"
        },
        queue: [
            {
                title: "Never Gonna Give You Up",
                author: "Rick Astley",
                requester: "DJ"
            },
            {
                title: "Never Gonna Give You Up",
                author: "Rick Astley",
                requester: "DJ"
            },
            {
                title: "Never Gonna Give You Up",
                author: "Rick Astley",
                requester: "DJ"
            },
            {
                title: "Never Gonna Give You Up",
                author: "Rick Astley",
                requester: "DJ"
            },
        ],
        songsLeft: 22
    }
    win.webContents.send('newExternalDisplayData', data)
    partylog('Sent External Display Window Test Data')
})

var gpOnSnapshotUnSub = null

ipcMain.on('gpUse', () => {
    partylog('GP Use has Started')
    if (!config.get('devSaveDB')) {
        gpOnSnapshotUnSub = db.collection('parties').doc(partyID).collection('guestPicks')
            .onSnapshot(function (snapshot) {
                snapshot.docChanges().forEach(function (change) {
                    if (change.type === "added") {
                        console.log("New Song: ", change.doc.data(), "\n Doc Name: ", change.doc._delegate._document.key.path.segments[3]);
                        // console.log(change.doc)
                        // console.log(change.doc._delegate)
                        // console.log(change.doc._delegate._document)
                        // console.log(change.doc._delegate._document.key)
                        // console.log(change.doc._delegate._document.key.path)
                        if (change.doc.data().url.toLowerCase().includes('youtube.com')) {
                            gpAdd(change.doc.data().url, change.doc.id)
                        } else {
                            gpAdd(change.doc.data().url, change.doc.id, change.doc.data().title, change.doc.data().artist)
                        }
                    }
                    if (change.type === "removed") {
                        console.log("Removed Song: ", change.doc.data());
                    }
                });
            });
    } else {
        gpAdd('https://www.youtube.com/watch?v=xOD4jR7zsjc', 0)
        gpAdd('https://www.youtube.com/watch?v=xOD4jR7zsjc', 1)
        gpAdd('https://www.youtube.com/watch?v=xOD4jR7zsjc', 2)
        gpAdd('https://www.youtube.com/watch?v=69CEiHfS_mc', 3)
        gpAdd('https://www.youtube.com/watch?v=69CEiHfS_mc', 4)
        gpAdd('https://www.youtube.com/watch?v=69CEiHfS_mc', 5)
        gpAdd('https://www.youtube.com/watch?v=6yvfU8xK_VQ', 6)
        gpAdd('https://www.youtube.com/watch?v=6yvfU8xK_VQ', 7)
        gpAdd('https://www.youtube.com/watch?v=6yvfU8xK_VQ', 8)
        gpAdd('https://music.youtube.com/watch?v=zVlFkFmk_NM&list=RDAMVMzVlFkFmk_NM', 9)
    }
})

ipcMain.on('requestCurrentRunningData', () => {
    partylog('Ren. Process Requested Current Running Scene')
    if (canary.queue.length != 0) {
        partylog('Sent Renderer Process GP is Running')
        mainWindow.webContents.send('callbackCurrentRunningData', {
            runningScene: 'GP',
            queue: canary.queue
        })
    }
})

ipcMain.on('clearQueue', () => { canary.queue = []; partylog('Cleared GP Queue') })

ipcMain.on('stopGP', () => {
    gpOnSnapshotUnSub()
})

function gpDeleteSong(docName) {
    db.collection('parties').doc(partyID).collection('guestPicks').doc(docName).delete().then(() => {
        canary.queue.splice(docName, 1)
        partylog('Deleted GP Song, Doc Name: ' + docName)
    })
}

ipcMain.on('gpDeleteSong', (e, docname) => gpDeleteSong(docname))

// ----------------------------
// KARAOKE
// ----------------------------

var karaokeOnSnapshotUnSub = null

function karaokeUse() {
    partylog('Karaoke Use has Started')
    karaokeOnSnapshotUnSub = db.collection('parties').doc(partyID).collection('karaoke').onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            if (change.type === "added") {
                console.log("New Song: ", change.doc.data(), "\n Doc Name: ", change.doc._delegate._document.key.path.segments[3]);
                if (change.doc.data().url.toLowerCase().includes('youtube.com')) {
                    karaokeAdd(change.doc.data().url, change.doc.id)
                } else {
                    karaokeAdd(change.doc.data(), change.doc.id)
                }
            }
            if (change.type === "removed") {
                console.log("Removed Song: ", change.doc.data());
            }
        });
    });
}