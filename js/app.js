// Import All Packages
//--------------------
// General Packages
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')

//--------------------
// Guest Picks Packages
var Soundplayer = require('play-sound')(opts = {})
const ytdl = require('youtube-mp3-downloader');
const fs = require('fs')
const EventEmitter = require('events');
var getYoutubeTitle = require('get-youtube-title')


//--------------------
// CODE
//--------------------
//
//
// GUEST PICKS

class Song {
    constructor(url, probarDiv) {
        this.url = url
        this.progressDiv = probarDiv
    }
}

var q = Array(Song);
q.pop();
var downloadedq = [];
var status = 'STOPPED'
var eventEmitter = new EventEmitter();
var partyID = '053467'

async function gpAdd(url) {
    return new Promise((resolve) => {
        console.info(`Adding ${url} to Playing Queue...`)
        var probar = document.createElement("div")
        q.push(new Song(url, probar))

        var main = document.getElementById('gpcolumn')
        var song = document.createElement("div")
        var songname = document.createElement("p")
        var deletei = document.createElement('i')
        var vidTitle = 'Unknown'

        var vidRaw = `?${url.split('?')[1]}`
        var v = new URLSearchParams(vidRaw).get('v');

        getYoutubeTitle(v, function (err, title) {
            vidTitle = title

            song.className = "song"
            songname.innerText = vidTitle;
            deletei.className = "fas fa-trash";
            probar.className = 'probar'

            song.appendChild(songname)
            song.appendChild(deletei)
            song.appendChild(probar)
            main.appendChild(song)
            resolve()
        })
    })
}

function gpAddDb(songList) {
  console.error('Not Supported Yet')
}

async function gpPlay(time, index) {
    if (downloadedq.length - 1 < index) return Error('Did not download requested song index')
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
    console.info(`Downloading ${link}, index ${index}...`)
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
        q[index].progressDiv.style.width = `${progress.progress.percentage.toString().split('.')[0]}%`
    });
    DOWNLOADER.download(v, `${index}.mp3`)
    DOWNLOADER.on("finished", function (err, data) {
        if (err) console.error(err)
        q[index].progressDiv.style.width = "0%"
        console.info('Downloaded: \n', JSON.stringify(data));
        downloadedq.push(data.youtubeLink)
        eventEmitter.emit(`downloadFinished ${index}`, "Event occurred");
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
    db.collection(partyID).doc("Guest Picks").collection('Queue')
    .onSnapshot(function(doc) {
        console.log("Current data: ", doc.data());
    });
    // await gpAdd('https://www.youtube.com/watch?v=LY39km8rkWY&list=PL2L0EVHlfS_LgbikIUg3O6rJ6b-T0EPjq&index=3')
    // await gpAdd('https://www.youtube.com/watch?v=w0AOGeqOnFY')
    // await gpAdd('https://www.youtube.com/watch?v=LDU_Txk06tM')
    var downloadingStatus = "WAITING"
    for (index = 0; index < q.length; index++) {
        if (status != 'STARTED') {
            console.info('Stopped Status, Stopping Function.')
            return 'Stopped by DJ';
        }
        await gpMain(index, downloadingStatus).then(() => {
            console.log('Song Done!')
        })
    }
}

const gpMain = async (index, downloadingStatus) => {
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
        await gpDownload(q[index].url, index)
        eventEmitter.on(`downloadFinished ${index}`, async () => {
            downloadingStatus = "PLAYING"
            console.log(`calling play from test ${index}`)
            await gpPlay(20, index)
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

function switchButton(switchto) {
    if (switchto == 'stop') {
        gpStartButton.value = 'STOP'
        gpStartButton.style.backgroundColor = 'red'
        gpStartButton.onclick = function (event) {
            console.log(event);
            stop()
            switchButton('start')
        }
    } else if (switchto == 'start') {
        gpStartButton.value = 'USE'
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
var gpSkipButton = document.getElementById("skipGuestPicks");
var gpAddSongButton = document.getElementById("addSongGuestPicks");
gpStartButton.onclick = (event) => {
    console.log(event);
    gpStart()
    switchButton('stop')
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