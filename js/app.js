// Import All Packages
var Soundplayer = require('play-sound')(opts = {})
const ytdl = require('youtube-mp3-downloader');
const fs = require('fs')
const EventEmitter = require('events');
const { resolve } = require('path');

var q = [];
var downloadedq = [];
var status = 'STOPPED'
var eventEmitter = new EventEmitter();

function add(url) {
    console.info(`Adding ${url} to Playing Queue...`)
    q.push(url)
}

async function play(time, index) {
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
    
        setTimeout(function () {
            songInstance.kill()
            return 0
        }, time * 1000);
    })
}

async function download(link, index) {
    console.info(`Downloading ${link}, index ${index}...`)
    var vidRaw = `?${link.split('?')[1]}`
    var v = new URLSearchParams(vidRaw).get('v');
    const DOWNLOADER = new ytdl({
        "ffmpegPath": "./assets/ffmpeg/ffmpeg",        // FFmpeg binary location
        "outputPath": "./music/",    // Output file location (default: the home directory)
        "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio
        "progressTimeout": 0,                // Interval in ms for the progress reports (default: 1000)
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

async function start() {
    if (status == 'STARTED') { console.error('Already Started'); return '' }
    console.info('Starting...')
    status = 'STARTED'
    add('https://www.youtube.com/watch?v=LY39km8rkWY&list=PL2L0EVHlfS_LgbikIUg3O6rJ6b-T0EPjq&index=3')
    add('https://www.youtube.com/watch?v=w0AOGeqOnFY')
    add('https://www.youtube.com/watch?v=LDU_Txk06tM')
    var downloadingStatus = "WAITING"
    for (index=0; index<q.length; index++) {
        await test(index, downloadingStatus).then(() => {
            console.log('Song Done!')
        })
    }
    // main(index, downloadingStatus)
    // eventEmitter.on('playFinished', () => {
    //     console.info('Starting next song...')
    //     index = index + 1
    //     downloadingStatus = "WAITING"
    //     main(index, downloadingStatus)
           //console.log(`one with ${index}`)
    // })
}

async function main(index, downloadingStatus) {
    downloadingStatus = "DOWNLOADING"
    await download(q[index], index)
    eventEmitter.on(`downloadFinished ${index}`, () => {
        downloadingStatus = "PLAYING"
        play(20, index)
    })
}

const test = async (index, downloadingStatus) => {
    return new Promise(async (resolve, reject) => {
        downloadingStatus = "DOWNLOADING"
        await download(q[index], index)
        eventEmitter.on(`downloadFinished ${index}`, async () => {
            downloadingStatus = "PLAYING"
            console.log(`calling play from test ${index}`)
            await play(60, index)
            resolve('Done')
            })
    })    
}

// function test() {
//     add('https://www.youtube.com/watch?v=LY39km8rkWY&list=PL2L0EVHlfS_LgbikIUg3O6rJ6b-T0EPjq&index=3')
//     add('https://www.youtube.com/watch?v=w0AOGeqOnFY')
//     add('https://www.youtube.com/watch?v=LDU_Txk06tM')
//     download(q[0], 0)
//     eventEmitter.on(`downloadFinished ${index}`, () => {
//         play(20, 0)
//     })
// }

function stop() {
    eventEmitter.emit('stop', "Event occurred");
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
            // download('https://www.youtube.com/watch?v=NUYvbT6vTPs', 5)
            start()
            switchButton('stop')

        }
    }
}


var startButton = document.getElementById("start");
startButton.onclick = function (event) {
    console.log(event);
    // download('https://www.youtube.com/watch?v=NUYvbT6vTPs', 5)
    start()
    switchButton('stop')

}
// download()