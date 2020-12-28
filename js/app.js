// Import All Packages

// General Packages

// Guest Picks Packages
var Soundplayer = require('play-sound')(opts = {})
const ytdl = require('youtube-mp3-downloader');
const fs = require('fs')
const EventEmitter = require('events');
const { resolve } = require('path');
var getYoutubeTitle = require('get-youtube-title')


// GUEST PICKS
var q = [];
var downloadedq = [];
var status = 'STOPPED'
var eventEmitter = new EventEmitter();

async function gpAdd(url) {
    return new Promise((resolve) => {
        console.info(`Adding ${url} to Playing Queue...`)
        q.push(url)
    
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
    
            song.appendChild(songname)
            song.appendChild(deletei)
            main.appendChild(song)
            resolve()
        })
    })
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
        "ffmpegPath": "./assets/ffmpeg/ffmpeg",  // || FFmpeg binary location
        "outputPath": "./music/",               //  || Output file location (default: the home directory)
        "youtubeVideoQuality": "highestaudio", //   || Desired video quality (default: highestaudio
        "progressTimeout": 0,                 //    || Interval in ms for the progress reports (default: 1000)
    });
    DOWNLOADER.on("progress", function (progress) {
        console.log(JSON.stringify(progress));
    });
    DOWNLOADER.download(v, `${index}.mp3`)
    DOWNLOADER.on("finished", function (err, data) {
        if (err) console.error(err)
        console.info('Downloaded: \n', JSON.stringify(data));
        downloadedq.push(data.youtubeLink)
        eventEmitter.emit(`downloadFinished ${index}`, "Event occurred");
    });
}

async function gpStart() {
    if (status == 'STARTED') { console.error('Already Started'); return '' }
    console.info('Starting...')
    eventEmitter.on('stop', () => {
        resolve()
        return 'Stopped by DJ'
    })
    status = 'STARTED'
    await gpAdd('https://www.youtube.com/watch?v=LY39km8rkWY&list=PL2L0EVHlfS_LgbikIUg3O6rJ6b-T0EPjq&index=3')
    await gpAdd('https://www.youtube.com/watch?v=w0AOGeqOnFY')
    await gpAdd('https://www.youtube.com/watch?v=LDU_Txk06tM')
    var downloadingStatus = "WAITING"
    for (index = 0; index < q.length; index++) {
        await gpMain(index, downloadingStatus).then(() => {
            console.log('Song Done!')
        })
    }
}

const gpMain = async (index, downloadingStatus) => {
    return new Promise(async (resolve, reject) => {
        downloadingStatus = "DOWNLOADING"
        await gpDownload(q[index], index)
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
        startButton.innerText = 'STOP'
        startButton.onclick = function (event) {
            console.log(event);
            stop()
            switchButton('start')
        }
    } else if (switchto == 'start') {
        startButton.innerText = 'START'
        startButton.onclick = function (event) {
            console.log(event);
            gpStart()
            switchButton('stop')

        }
    }
}

var startButton = document.getElementById("startGuestPicks");
startButton.onclick = function (event) {
    console.log(event);
    gpStart()
    switchButton('stop')

}