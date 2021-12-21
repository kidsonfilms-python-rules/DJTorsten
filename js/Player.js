const { ipcRenderer } = require("electron");
const Config = require('electron-store')

const config = new Config()

var playing = false;
var playTimeInterval = null
var videoDur = 0
var player = null
var playerTimeout = null
var stop = null

function play(vidID, time, index) {
    if (playing) return new Error('Player Already Playing, Stop Current Player')
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: vidID,
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'controls': 0,
            'rel': 0,
            'fs': 0,
        },
        origin: 'https://djflame.tech'
    });


    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
        event.target.playVideo();
        playing = true
        videoDur = event.target.getDuration()
        playTimeInterval = window.setInterval(function () {
            const percentage = ((event.target.getCurrentTime() / videoDur) * 100)
            var favSongs = config.get('heartSongs')
            var isFav = false;
            if (favSongs.includes(event.target.getVideoData().video_id)) isFav = true
            ipcRenderer.send('canaryPlayTime', { percentage: percentage, seconds: event.target.getCurrentTime(), duration: videoDur, index: index, fav: isFav })
        }, 1000);
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    var done = false;
    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
            playerTimeout = setTimeout(stopVideo, time);
            done = true;
        } else if (event.data === 0) {
            stopVideo()
        }
    }
    function stopVideo() {
        player.stopVideo();
        player.destroy();
        playing = false
        clearInterval(playTimeInterval)
        clearTimeout(playerTimeout)
        ipcRenderer.send('canaryStopped', '')
    }

    stop = stopVideo;

    ipcRenderer.on('canaryStop', () => {
        stopVideo()
    })
}

ipcRenderer.on('canaryPlay', (e, data) => {
    console.log('[CANARY] Playing Started')
    console.log('[CANARY] Playing New Song! SONG: ' + data.id)
    console.log(`[CANARY] RAW DATA:` + data)
    console.log(data)
    console.log(e)
    play(data.id, data.time, data.index)
})

ipcRenderer.on('canaryChangePlayHead', (e, data) => {
    const secs = (data * videoDur) / 100
    console.log('Got New Player Head! Moving to ' + secs)
    player.seekTo(secs)
    clearTimeout(playerTimeout)
})
ipcRenderer.on('canaryControllerPlay', (e, data) => {
    player.playVideo()
    clearTimeout(playerTimeout)
})
ipcRenderer.on('canaryPause', (e, data) => {
    player.pauseVideo()
    clearTimeout(playerTimeout)
})
ipcRenderer.on('canarySkip', (e, data) => {
    clearTimeout(playerTimeout)
    stop()
})
ipcRenderer.on('canaryMute', (e, data) => {
    console.log(data)
    if (data == 1) {
        console.log('Muting')
        clearTimeout(playerTimeout)
        player.mute();
    } else {
        console.log('Unmuting')
        clearTimeout(playerTimeout)
        player.unMute();
    }
})