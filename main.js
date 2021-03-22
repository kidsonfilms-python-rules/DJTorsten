// Modules to control application life and create native browser window
const electron = require('electron')
const { app, BrowserWindow, ipcMain, desktopCapturer } = electron
const path = require('path')

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
            enableRemoteModule: true
        },
        icon: './assets/DJFlame Logo.svg'
    })
    // and load the index.html of the app.
    mainWindow.loadFile('loading.html').then(() => {
        mainWindow.show()
    })

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

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
//--------------------
// Guest Picks Packages
var Soundplayer = require('play-sound')(opts = {})
const ytdl = require('youtube-mp3-downloader');
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

config.set('devSaveDB', true)
if (config.get('devSaveDB')) {
    config.set('signInInfo', false)
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

config.set('partyCode', '053467')
ipcMain.on('joinLastParty', () => {
    if (config.get('partyCode')) {
        mainWindow.webContents.send('joinLastPartyCallback', true)
        partyID = config.get('partyCode')
        getSceneSettings()
    } else {
        mainWindow.webContents.send('joinLastPartyCallback', false)
    }
})

function getSceneSettings() {
    if (!config.get('devSaveDB')) {
        db.collection(partyID).doc('metadata').get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
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
                        }
                    }
                })
                console.log(config.get('sceneSettings'))
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    } else {
        console.log('Entering Developer Database Saving Mode...')
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
    config.set('sceneSettings', data)
    db.collection(partyID).doc('metadata').set({
        guestPicks: data.general.guestPicks,
        guestPicksExternalDisplay: data.guestPicks.externalDisplay,
        guestPicksSongLenRandom: data.guestPicks.songLength.random,
        guestPicksSongLenRange1: data.guestPicks.songLength.range1,
        guestPicksSongLenRange2: data.guestPicks.songLength.range2,
        karaoke: data.general.karaoke
    })
})

ipcMain.on('requestSceneSettings', () => {
    mainWindow.webContents.send('requestedSceneSettings', config.get('sceneSettings'))
})

// GUEST PICKS

class Song {
    constructor(url, probarDiv, docName, title, author, requester) {
        this.url = url
        this.progressDiv = probarDiv
        this.docName = docName
        this.title = title
        this.author = author
        this.requester = requester
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

async function gpAdd(url, docName) {
    console.info(`Adding ${url} to Playing Queue...`)
    var vidRaw = `?${url.split('?')[1]}`
    var v = new URLSearchParams(vidRaw).get('v');
    var videoInfo = await yts({ videoId: v })
    q.push(new Song(url, '', docName, videoInfo.title, videoInfo.author.name, 'DJ'))
    mainWindow.webContents.send('gpAdd', { url, docName })
}

ipcMain.on('gpAdd', (event, data) => {
    gpAdd(data.url, data.docName)
})

function gpAddDb(songList) {
    console.warn('Still in EXPERIMENTAL')
    if (config.get('devSaveDB')) {
        songList.forEach((s) => {
            gpAdd(s, q.length + 4)
        })
    } else {
        songList.forEach((s, i) => {
            db.collection(partyID).doc("Guest Picks").get().then((doc) => {
                db.collection(partyID).doc('Guest Picks').collection('Queue').doc((doc.data().currentDocName + 1).toString()).set({
                    url: s,
                    submitter: "DJ"
                })
                    .then(function () {
                        console.log("Document successfully written!");
                        db.collection(partyID).doc('Guest Picks').update({
                            currentDocName: firebase.firestore.FieldValue.increment(1)
                        });
                    })
                    .catch(function (error) {
                        console.error("Error writing document: ", error);
                    });
            })
        })
    }
}

async function gpPlay(time, index, currentI) {
    // if (downloadedq.length - 1 < index) return Error('Did not download requested song index')
    console.info(`Playing ${index}.mp3...`)
    return new Promise(async (resolve) => {
        var songInstance = Soundplayer.play(`./music/${index}.mp3`, function (err) {
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

async function gpDownload(link, index) {
    if (downloadedq.map(a => a.url).includes(link)) {
        var linkMap = await downloadedq.map(a => a.url)
        var cachei = await arrayContains(link, linkMap)
        eventEmitter.emit(`downloadFinished ${index}`, downloadedq[cachei].i);
        return 'Already Downloaded'
    }
    console.info(`Downloading ${link}, index ${index}...`)
    const probar = q[index].progressDiv
    var vidRaw = `?${link.split('?')[1]}`
    var v = new URLSearchParams(vidRaw).get('v');
    const DOWNLOADER = new ytdl({
        "ffmpegPath": "./assets/ffmpeg/ffmpeg", // || FFmpeg binary location
        "outputPath": "./music/", //  || Output file location (default: the home directory)
        "youtubeVideoQuality": "highestaudio", //   || Desired video quality (default: highestaudio
        "progressTimeout": 0, //    || Interval in ms for the progress reports (default: 1000)
    });
    DOWNLOADER.on("progress", function (progress) {
        console.log(JSON.stringify(progress));
        mainWindow.webContents.send('setProbarWidth', { link: link, width: progress.progress.percentage.toString().split('.')[0] })
        // probar.style.width = `${progress.progress.percentage.toString().split('.')[0]}%`
    });
    DOWNLOADER.download(v, `${index}.mp3`)
    DOWNLOADER.on("finished", function (err, data) {
        DOWNLOADER.removeAllListeners("progress")
        if (err) console.error(err)
        mainWindow.webContents.send('setProbarWidth', { link: link, width: "0" })
        console.info('Downloaded: \n', JSON.stringify(data));
        downloadedq.push(new DownloadSong(link, index, data.title, data.thumbnail, data.artist))
        eventEmitter.emit(`downloadFinished ${index}`, index);
    });
}

async function gpStart() {
    if (status == 'STARTED') { console.error('Already Started'); return '' }
    console.info('Starting...')
    eventEmitter.on('stop', () => {
        console.info('Stopping...')
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
    while (true) {
        if (status != 'STARTED') {
            console.info('Stopped Status, Stopping Function.')
            return 'Stopped by DJ';
        }
        if (index < q.length) {
            await gpMain(index, downloadingStatus).then(() => {
                console.log('Song Done!')
                index = index + 1
            })
        } else {
            await sleep(1000);
        }
    }
}

ipcMain.on('gpStart', () => gpStart())

async function gpMain(index, downloadingStatus) {
    if (status != 'STARTED') {
        console.error('Status: STOPPED')
        return 'Stopped by DJ';
    }
    return new Promise(async (resolve) => {
        eventEmitter.on('stop', () => {
            resolve();
            return 'Stopped by DJ';
        })
        downloadingStatus = "DOWNLOADING"
        gpDownload(q[index].url, index)
        eventEmitter.on(`downloadFinished ${index}`, async (i) => {
            downloadingStatus = "PLAYING"
            console.log(`Playing Index ${index}, From ${i}`)
            await gpPlay(40, i, index)
            resolve('Done')
        })
    })
}


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
    choiceExternalDisplay = d
})

var win = null

function launchExternalDisplay() {
    if (win) {
        win.close()
        win = null
    }
    if (choiceExternalDisplay) {
        var d = choiceExternalDisplay
        var dchoice = '1'
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
                contextIsolation: false
            }
        })
        // win.setKiosk(true);
        win.loadFile(`./windows/externalDisplaysGP/externalDisplayGP${dchoice}.html`)
        win.show()
        ipcMain.on('stop', () => {
            win.close()
            win = null
        })

        win.on('close', () => win = null)
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
        ]
    }
    win.webContents.send('newExternalDisplayData', data)
})

ipcMain.on('gpUse', () => {
    if (!config.get('devSaveDB')) {
        db.collection(partyID).doc("Guest Picks").collection('Queue')
            .onSnapshot(function (snapshot) {
                snapshot.docChanges().forEach(function (change) {
                    if (change.type === "added") {
                        console.log("New Song: ", change.doc.data(), "\n Doc Name: ", change.doc._delegate._document.key.path.segments[3]);
                        // console.log(change.doc)
                        // console.log(change.doc._delegate)
                        // console.log(change.doc._delegate._document)
                        // console.log(change.doc._delegate._document.key)
                        // console.log(change.doc._delegate._document.key.path)
                        gpAdd(change.doc.data().url, change.doc._delegate._document.key.path.segments[3])
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
    if (q.length != 0) {
        mainWindow.webContents.send('callbackCurrentRunningData', {
            runningScene: 'GP',
            queue: q
        })
    }
})

ipcMain.on('clearQueue', () => q = [])

function gpDeleteSong(docName) {
    db.collection(partyID).doc('Guest Picks').collection('Queue').doc(docName).delete().then(() => {
        q.splice(docName, 1)
        song.remove()
    })
}

ipcMain.on('gpDeleteSong', (e, docname) => gpDeleteSong(docname))
// var gpStartButton = document.getElementById("startGuestPicks");
// var gpUseButton = document.getElementById("useGuestPicks");
// var gpSkipButton = document.getElementById("skipGuestPicks");
// var gpAddSongButton = document.getElementById("addSongGuestPicks");
// gpStartButton.onclick = (event) => {
//     console.log(event);
//     gpStart()
//     switchButton('stop')
// }

// gpUseButton.onclick = () => {
//     gpUse()
// }

// gpSkipButton.onclick = () => {
//     console.log('SKIPPING...')
//     skip()
// }

// gpAddSongButton.onclick = () => {
//     if (addSongWindow) {
//         addSongWindow.focus()
//         return
//     }

//     addSongWindow = new BrowserWindow({
//         width: 600,
//         height: 400,
//         vibrancy: 'ultra-dark',
//         maximizable: false,
//         minimizable: false,
//         frame: false, //TODO: CHANGE TO FALSE
//         resizable: false,
//         contextIsolation: true,
//         webPreferences: {
//             nodeIntegration: true,
//             enableRemoteModule: true,
//             contextIsolation: false,
//         },
//         alwaysOnTop: true,
//         show: false,
//     });

//     addSongWindow.loadURL(`file://${__dirname}/gpAddSong.html`)

//     addSongWindow.show()

//     addSongWindow.on('closed', function () {
//         addSongWindow = null
//     })
// }

// ipcRenderer.on('gpAddSongRen', (e, songList) => {
//     console.log(songList)
//     gpAddDb(songList)
// })