// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
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
    }
  })
  // and load the index.html of the app.
  mainWindow.loadFile('signin.html')
  mainWindow.show()

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

// GUEST PICKS

class Song {
    constructor(url, probarDiv, docName) {
        this.url = url
        this.progressDiv = probarDiv
        this.docName = docName
    }
}

class DownloadSong {
    constructor(url, i) {
        this.url = url;
        this.i = i;
    }
}

var q = Array(Song);
q.pop();
var downloadedq = [];
var status = 'STOPPED'
var eventEmitter = new EventEmitter();
var partyID = '053467'

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
    q.push(new Song(url, docName))
    mainWindow.webContents.send('gpAdd', {url, docName})
}

ipcMain.on('gpAdd', (event, data) => {
  gpAdd(data.url, data.docName)
})

function gpAddDb(songList) {
    console.warn('Still in EXPERIMENTAL')
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

async function gpPlay(time, index) {
    // if (downloadedq.length - 1 < index) return Error('Did not download requested song index')
    console.info(`Playing ${index}.mp3...`)
    return new Promise(async (resolve) => {
        var songInstance = Soundplayer.play(`./music/${index}.mp3`, function (err) {
            if (err) console.error(err);
            console.log("Audio finished");
            resolve()
        });
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
        mainWindow.webContents.send('setProbarWidth', {link: link, width: progress.progress.percentage.toString().split('.')[0]})
        // probar.style.width = `${progress.progress.percentage.toString().split('.')[0]}%`
    });
    DOWNLOADER.download(v, `${index}.mp3`)
    DOWNLOADER.on("finished", function (err, data) {
        DOWNLOADER.removeAllListeners("progress")
        if (err) console.error(err)
        mainWindow.webContents.send('setProbarWidth', {link: link, width: "0"})
        console.info('Downloaded: \n', JSON.stringify(data));
        downloadedq.push(new DownloadSong(link, index))
        eventEmitter.emit(`downloadFinished ${index}`, index);
    });
}

async function gpStart() {
    if (status == 'STARTED') { console.error('Already Started'); return '' }
    console.info('Starting...')
    eventEmitter.on('stop', () => {
        console.info('Stopping...')
        status = 'STOPPED'
        return 'Stopped by DJ';
    })
    status = 'STARTED'
    // await gpAdd('https://www.youtube.com/watch?v=LY39km8rkWY&list=PL2L0EVHlfS_LgbikIUg3O6rJ6b-T0EPjq&index=3')
    // await gpAdd('https://www.youtube.com/watch?v=w0AOGeqOnFY')
    // await gpAdd('https://www.youtube.com/watch?v=LDU_Txk06tM')
    var downloadingStatus = "WAITING"
    var index = 0;
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

ipcMain.on('gpStart' , () => gpStart())

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
            await gpPlay(20, i)
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
ipcRenderer.on('skip', () => skip())

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