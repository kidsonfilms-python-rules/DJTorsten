var player = require('play-sound')(opts = {})
const ytdl = require('youtube-mp3-downloader');
const fs = require('fs')

class Player {
    constructor() {
       this.q = [],
       this.downloadedq = []
    }
    
    add(url) {
       this.q.push(url)
    }

    async play(time, index) {
        if (this.downloadedq.length - 1 < index) return Error('Did not download requested song index')
        var songInstance = player.play('./music/video.mp3', function (err) {
            if (err) console.error(err);
            console.log("Audio finished");
        });
        setTimeout(function(){
            songInstance.kill()
            return 0
        }, time * 1000);
    }

    async download(link) {
        var vidRaw = `?${link.split('?')[1]}`
        var v = new URLSearchParams(vidRaw).get('v');
        const DOWNLOADER = new ytdl({
            "ffmpegPath": "./assets/ffmpeg/ffmpeg",        // FFmpeg binary location
            "outputPath": "./music/",    // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio
            "progressTimeout": 0,                // Interval in ms for the progress reports (default: 1000)
        });
        await DOWNLOADER.download(v, "video.mp3")
        DOWNLOADER.on("finished", function (err, data) {
            if (err) console.error(err)
            console.log('Downloaded: \n', JSON.stringify(data));
            this.downloadedq.push(link)
        });
    }

    start() {
        this.download('https://www.youtube.com/watch?v=NUYvbT6vTPs').then(() => {
            this.play(20, 0)
        })
    }
}

module.exports = Player;