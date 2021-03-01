// Import All Packages
//--------------------
// General Packages
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow
//--------------------
// Guest Picks Packages
const yts = require('yt-search')


//--------------------
// CODE
//--------------------
//


var addSongWindow = null

function arrayContains(needle, haystack) {
    return (haystack.indexOf(needle));
}

var q = []
var partyID = '053467'

class Song {
    constructor(url, probarDiv, docName) {
        this.url = url
        this.progressDiv = probarDiv
        this.docName = docName
    }
}

function testingWhileDBIsBroken() {
    ipcRenderer.send('gpAdd', {url: 'https://www.youtube.com/watch?v=zVlFkFmk_NM', docName: '0'})
    ipcRenderer.send('gpAdd', {url: 'https://www.youtube.com/watch?v=6yvfU8xK_VQ', docName: '1'})
    ipcRenderer.send('gpAdd', {url: 'https://www.youtube.com/watch?v=9SdSfbatWqw', docName: '2'})
    ipcRenderer.send('gpAdd', {url: 'https://www.youtube.com/watch?v=69CEiHfS_mc', docName: '3'})
    ipcRenderer.send('gpAdd', {url: 'https://www.youtube.com/watch?v=2AeEd195SG8"', docName: '4'})
}


var gpStartButton = document.getElementById("startGuestPicks");
var gpUseButton = document.getElementById("useGuestPicks");
var gpSkipButton = document.getElementById("skipGuestPicks");
var gpAddSongButton = document.getElementById("addSongGuestPicks");
gpStartButton.onclick = (event) => {
    console.log(event);
    ipcRenderer.send('gpStart')
    switchButton('stop')
}

gpUseButton.onclick = () => {
    gpUse()
}

gpSkipButton.onclick = () => {
    console.log('SKIPPING...')
    ipcRenderer.send('skip')
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

    addSongWindow.loadURL(`file://${__dirname}/windows/gpAddSong.html`)

    addSongWindow.show()

    addSongWindow.on('closed', function () {
        addSongWindow = null
    })
}

ipcRenderer.on('setProbarWidth', async (e, data) => {
    var linkMap = await q.map(a => a.url)
    var cachei = await arrayContains(data.link, linkMap)
    q[cachei].progressDiv.style.width = `${data.width}%`
    console.log(q[cachei].progressDiv.style.width)
})

ipcRenderer.on('gpAdd', async (e, data) => {
    var url = data.url
    var docName = data.docName
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
})

var gpuseval = 0

function gpUse() {
    if (gpuseval == 0) {
        gpuseval = 1
        document.getElementById('startGuestPicks').style = 'display: block;'
        document.getElementById('useGuestPicks').value = 'UNHAND'
        document.getElementById('gpqueuediv').style = 'display: block;'
        // testingWhileDBIsBroken()
        // db.collection(partyID).doc("Guest Picks").collection('Queue')
        //     .onSnapshot(function (snapshot) {
        //         snapshot.docChanges().forEach(function (change) {
        //             if (change.type === "added") {
        //                 console.log("New Song: ", change.doc.data());
        //                 ipcRenderer.send('gpAdd', {url: change.doc.data().url, docName: change.doc._delegate._document.key.path.segments[8]})
        //             }
        //             if (change.type === "removed") {
        //                 console.log("Removed Song: ", change.doc.data());
        //             }
        //         });
        //     });
        ipcRenderer.send('gpUse', 'Start')
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
            ipcRenderer.send('stop', 'random shit')
            switchButton('start')
        }
    } else if (switchto == 'start') {
        gpStartButton.value = 'USE'
        document.getElementById('useGuestPicks').value = 'UNHAND'
        gpStartButton.style.backgroundColor = 'rgb(24, 24, 24)'
        gpStartButton.onclick = function (event) {
            console.log(event);
            ipcRenderer.send('gpStart')
            switchButton('stop')

        }
    }
}