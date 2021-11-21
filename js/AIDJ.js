var AudioContext = require("web-audio-api").AudioContext;
var MusicTempo = require("music-tempo");
var fs = require("fs");
const path = require('path')
const Speaker = require('speaker')
const tf = require('@tensorflow/tfjs-node')
const aidj = require('../AIDJ/src/build/Release/djflame_aidj')

const audioExts = [".mp3", ".wav"]
const CLL = []

function sleep(ms, callback) {
    return new Promise((resolve) => {
        function endFunction() {
            callback()
            resolve()
        }
        setTimeout(endFunction, ms);
    });
}

class CLLSong {
    constructor(path, name) {
        this.path = path
        this.name = name
        this.tempo = 0
        this.beats = []
    }

    setTempo(newTempo) {
        console.log('Updated Tempo to ' + newTempo.tempo)
        this.tempo = parseFloat(newTempo.tempo)
        this.beats = newTempo.beats
    }
}

async function loadSongtoLibrary(fpath) {
    if (fs.statSync(fpath).isDirectory()) {
        const audioFiles = fs.readdirSync(fpath)
        var audioFilesNum = 0
        audioFiles.forEach(async (file) => {
            if (audioExts.includes(path.extname(file))) {
                const song = new CLLSong(fpath + file, file.split('.')[0])
                CLL.push(song);
                audioFilesNum += 1
                song.setTempo(await getAudioTempo(fpath + file))
            }
        })
        console.log(`Loaded Directory! Loaded ${audioFilesNum} Songs in Total!`)
    } else {
        const song = new CLLSong(fpath, fpath.split('.')[0])
        CLL.push(song);
        song.setTempo(await getAudioTempo(fpath))
        console.log(`Loaded ${fpath.split('.')[0]}!`)
    }
}

function getAudioTempo(filepath) {
    return new Promise((resolve, reject) => {
        // if (filepath.split('/')[5].split('.')[0] != 'Dante Rives - Sooth') {
        console.log('Calculating Tempo for ' + filepath.split('/')[5].split('.')[0])
        var calcTempo = function (buffer) {
            try {
                var audioData = [];
                // Take the average of the two channels
                if (buffer.numberOfChannels == 2) {
                    var channel1Data = buffer.getChannelData(0);
                    var channel2Data = buffer.getChannelData(1)
                    var length = channel1Data.length;
                    for (var i = 0; i < length; i++) {
                        audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
                    }
                } else {
                    audioData = buffer.getChannelData(0);
                }
                console.log(audioData)
                var mt = new MusicTempo(audioData);

                // console.log(mt.tempo);
                // console.log(mt.beats);
                resolve(mt)
                return mt;
            } catch (err) {
                console.log(err)
            }

        }

        var data = fs.readFileSync(filepath);

        var context = new AudioContext();
        context.decodeAudioData(data, calcTempo);
        // }

    })
}

function play(url, time) {
    var data = fs.readFileSync(url)

    var context = new AudioContext();
    context.outStream =
        context.decodeAudioData(data, onDecoded)
    var startTime = 0;

    context.outStream = new Speaker({
        channels: context.format.numberOfChannels,
        bitDepth: context.format.bitDepth,
        sampleRate: context.sampleRate
    })

    function onDecoded(buffer) {
        console.log('Playing ' + url + ' for ' + time + 's')
        console.log('Song length: ' + Math.round(buffer.duration) + 's')
        var source = context.createBufferSource();
        source.buffer = buffer;
        const volume = context.createGain()
        volume.gain.value = 1
        volume.connect(context.destination)
        source.connect(volume);

        source.start(startTime);

        sleep(time * 1000, () => {
            volume.gain.linearRampToValueAtTime(0, context.currentTime + 5)
            source.stop(startTime + time + 6)
            sleep(6000, () => {
                source.disconnect()
                volume.disconnect()
                console.log('Sources Disconnected')
            })
        })
    }
}

async function genSpectrogram(url) {
    var data = fs.readFileSync(url)

    const context = new AudioContext()
    const audioBuffer = await context.decodeAudioData(data)

    const output = Array.from(Array(tickCount)).map(() => Array.from(Array(strideSize)))
    for (let row = 0; row < strideSize; row += 1) {
        output[row] = arr.slice(row * strideSize, row * strideSize + strideSize)
    }
}

async function loadModel() {
    const model = await tf.loadLayersModel('file://../AIDJ/WUP/tfjs_files/model.json')
    
    model.predict()
}

// loadSongtoLibrary('/Users/siddharth/Downloads/Pop & Mainstream/')
// play('/Users/siddharth/Downloads/Pop & Mainstream/DJ Prashant, Jireh - Tumbiton.mp3', 17)
// genSpectrogram('/Users/siddharth/Downloads/Pop & Mainstream/DJ Prashant, Jireh - Tumbiton.mp3')
// loadModel()
console.log(aidj.play())