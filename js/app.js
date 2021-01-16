// Import All Packages
//--------------------
// General Packages
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
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
    var probar = document.createElement("div")
    q.push(new Song(url, probar, docName))

    var main = document.getElementById('gpcolumn')
    var song = document.createElement("div")
    var songname = document.createElement("p")
    var deletei = document.createElement('i')

    songname.innerText = '--'

    song.className = "song"
    deletei.className = "fas fa-trash";
    deletei.onclick = () => {
        db.collection(partyID).doc('Guest Picks').collection('Queue').doc(docName).delete().then(() => {
            console.log(`Succesfully Deleted ${url}!`)
            q.splice(docName, 1)
            song.remove()
        })
    }
    probar.className = 'probar'
    song.appendChild(songname)
    song.appendChild(deletei)
    song.appendChild(probar)
    console.log('Added Probar')
    main.appendChild(song)

    var vidRaw = `?${url.split('?')[1]}`
    var v = new URLSearchParams(vidRaw).get('v');

    var videoInfo = await yts({ videoId: v })
    // yt.retrieve(v, function (err, videoInfo) {
    //     if (err) throw err
    //     vidTitle = videoInfo.title
    //     console.log(videoInfo)
    //     songname.innerText = vidTitle;
    // })
    vidTitle = videoInfo.title
    console.log(videoInfo)
    songname.innerText = vidTitle;
}

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
        probar.style.width = `${progress.progress.percentage.toString().split('.')[0]}%`
    });
    DOWNLOADER.download(v, `${index}.mp3`)
    DOWNLOADER.on("finished", function (err, data) {
        DOWNLOADER.removeAllListeners("progress")
        if (err) console.error(err)
        probar.style.width = "0%"
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

function skip() {
    eventEmitter.emit('skip', "Event occurred");
}

var gpuseval = 0

function gpUse() {
    if (gpuseval == 0) {
        gpuseval = 1
        document.getElementById('startGuestPicks').style = 'display: block;'
        document.getElementById('useGuestPicks').value = 'UNHAND'
        document.getElementById('gpqueuediv').style = 'display: block;'

        db.collection(partyID).doc("Guest Picks").collection('Queue')
            .onSnapshot(function (snapshot) {
                snapshot.docChanges().forEach(function (change) {
                    if (change.type === "added") {
                        console.log("New Song: ", change.doc.data());
                        gpAdd(change.doc.data().url, change.doc._delegate._document.key.path.segments[8])
                    }
                    if (change.type === "removed") {
                        console.log("Removed Song: ", change.doc.data());
                    }
                });
            });
    } else if (gpuseval == 1) {
        gpuseval = 0
        document.getElementById('startGuestPicks').style = 'display: none;'
        document.getElementById('gpqueuediv').style = 'display: none;'
        q = []
        document.getElementById('useGuestPicks').value = 'USE'
        document.getElementById('gpcolumn').textContent = '';
    }
}

function switchButton(switchto) {
    if (switchto == 'stop') {
        gpStartButton.value = 'STOP'
        gpStartButton.style.backgroundColor = 'red'
        document.getElementById('useGuestPicks').value = 'PAUSE'
        gpStartButton.onclick = function (event) {
            console.log(event);
            stop()
            switchButton('start')
        }
    } else if (switchto == 'start') {
        gpStartButton.value = 'USE'
        document.getElementById('useGuestPicks').value = 'UNHAND'
        gpStartButton.style.backgroundColor = 'rgb(24, 24, 24)'
        gpStartButton.onclick = function (event) {
            console.log(event);
            gpStart()
            switchButton('stop')

        }
    }
}

var addSongWindow = null

var gpStartButton = document.getElementById("startGuestPicks");
var gpUseButton = document.getElementById("useGuestPicks");
var gpSkipButton = document.getElementById("skipGuestPicks");
var gpAddSongButton = document.getElementById("addSongGuestPicks");
gpStartButton.onclick = (event) => {
    console.log(event);
    gpStart()
    switchButton('stop')
}

gpUseButton.onclick = () => {
    gpUse()
}

gpSkipButton.onclick = () => {
    console.log('SKIPPING...')
    skip()
}

gpAddSongButton.onclick = () => {
    if (addSongWindow) {
        addSongWindow.focus()
        return
    }

    addSongWindow = new BrowserWindow({
        width: 600,
        height: 400,
        vibrancy: 'ultra-dark',
        maximizable: false,
        minimizable: false,
        frame: false, //TODO: CHANGE TO FALSE
        resizable: false,
        contextIsolation: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
        alwaysOnTop: true,
        show: false,
    });

    addSongWindow.loadURL(`file://${__dirname}/gpAddSong.html`)

    addSongWindow.show()

    addSongWindow.on('closed', function () {
        addSongWindow = null
    })
}

ipcRenderer.on('gpAddSongRen', (e, songList) => {
    console.log(songList)
    gpAddDb(songList)
})