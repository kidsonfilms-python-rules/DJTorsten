// Import All Packages
const ytdl = require('youtube-mp3-downloader');
const { createAudio } = require('node-mp3-player')
const Audio = createAudio();
const fs = require('fs')


async function play() {
        var player = require('play-sound')(opts = {})

    await player.play('./music/video.mp3', function (err) {
        if (err) console.error(err);
        console.log("Audio finished");
    });
    
}

async function download() {
    const DOWNLOADER = new ytdl({
        "ffmpegPath": "./assets/ffmpeg/ffmpeg",        // FFmpeg binary location
        "outputPath": "./music/",    // Output file location (default: the home directory)
        "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio
        "progressTimeout": 0,                // Interval in ms for the progress reports (default: 1000)
    });
    await DOWNLOADER.download("oHg5SJYRHA0", "video.mp3")
    DOWNLOADER.on("finished", function(err, data) {
        if (err) console.error(err)
        console.log(JSON.stringify(data));
        play()
    });
}

download()