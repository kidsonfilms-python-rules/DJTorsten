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
    ipcRenderer.send('gpAdd', { url: 'https://www.youtube.com/watch?v=zVlFkFmk_NM', docName: '0' })
    ipcRenderer.send('gpAdd', { url: 'https://www.youtube.com/watch?v=6yvfU8xK_VQ', docName: '1' })
    ipcRenderer.send('gpAdd', { url: 'https://www.youtube.com/watch?v=9SdSfbatWqw', docName: '2' })
    ipcRenderer.send('gpAdd', { url: 'https://www.youtube.com/watch?v=69CEiHfS_mc', docName: '3' })
    ipcRenderer.send('gpAdd', { url: 'https://www.youtube.com/watch?v=2AeEd195SG8"', docName: '4' })
}



async function tryFillData() {
    ipcRenderer.send('requestCurrentRunningData')
    ipcRenderer.on('callbackCurrentRunningData', (err, d) => {
        console.log(d)
        if (d.runningScene == 'GP') {
            console.log('GP is running')
            switchButton('stop')
            gpuseval = 1
            document.getElementById('startGuestPicks').style = 'display: block;'
            document.getElementById('useGuestPicks').value = 'UNHAND'
            document.getElementById('gpqueuediv').style = 'display: block;'

            d.queue.forEach(async (data) => {
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
                song.id = 'song-' + docName
                deletei.className = "fas fa-trash";
                deletei.onclick = () => ipcRenderer.send('gpDeleteSong', docName)
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

                document.getElementById('deleteSongElement').onclick = () => {ipcRenderer.send('gpDeleteSong', docName); song.remove()}
                const instance = tippy(song, {
                    // content: document.getElementById('songCardsRightClickMenuTemplate').innerHTML,
                    content: `<div id="songCardsRightClickMenuTemplate">
                    <div class="menuItem dangerMenuItem">
                      <a onclick="ipcRenderer.send('gpDeleteSong', '${docName}'); document.getElementById('song-${docName}').remove();" id="deleteSongElement" class="dangerMenuText">Delete</a>
                    </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="">Report Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="">Report User</a>
                      </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="">Rate Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="">Favorite Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="">Award Song</a>
                      </div>
                  </div>`,
                    placement: 'right-start',
                    trigger: 'manual',
                    interactive: true,
                    arrow: false,
                    offset: [0, 0],
                    allowHTML: true,
                    theme: 'rightClick'
                  });
                  song.addEventListener('contextmenu', (event) => {
                      console.log('right clicked')
                    event.preventDefault();
                  
                    instance.setProps({
                      getReferenceClientRect: () => ({
                        width: 0,
                        height: 0,
                        top: event.clientY,
                        bottom: event.clientY,
                        left: event.clientX,
                        right: event.clientX,
                      }),
                    });
                  
                    instance.show();
                  });
            })
        }
    })
}

tryFillData()


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
     var winSettings = (process.platform) == 'darwin' ? {
        width: 600,
        height: 400,
        vibrancy: 'fullscreen-ui',
        maximizable: false,
        minimizable: false,
        frame: false, //TODO: CHANGE TO FALSE
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            devTools: false
        },
        alwaysOnTop: true,
        show: false,
    } : {
        width: 600,
        height: 400,
        backgroundColor: "#202020",
        maximizable: false,
        minimizable: false,
        frame: false, //TODO: CHANGE TO FALSE
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            devTools: false
        },
        alwaysOnTop: true,
        show: false,
    }
    addSongWindow = new BrowserWindow(winSettings);

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
    song.id = 'song-' + docName
    deletei.className = "fas fa-trash";
    deletei.onclick = () => {
        ipcRenderer.send('gpDeleteSong', docName)
        song.remove()
    }
    probar.className = 'probar'
    song.appendChild(songname)
    song.appendChild(deletei)
    song.appendChild(probar)
    console.log('Added Probar')
    main.appendChild(song)

    document.getElementById('deleteSongElement').onclick = () => {ipcRenderer.send('gpDeleteSong', docName); song.remove()}
        const instance = tippy(song, {
        // content: document.getElementById('songCardsRightClickMenuTemplate').innerHTML,
        content: `<div id="songCardsRightClickMenuTemplate">
                    <div class="menuItem dangerMenuItem">
                      <a onclick="ipcRenderer.send('gpDeleteSong', '${docName}'); document.getElementById('song-${docName}').remove();" id="deleteSongElement" class="dangerMenuText">Delete</a>
                    </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="">Report Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="">Report User</a>
                      </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="">Rate Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="">Favorite Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="">Award Song</a>
                      </div>
                  </div>`,
        placement: 'right-start',
        trigger: 'manual',
        interactive: true,
        arrow: false,
        offset: [0, 0],
        allowHTML: true,
        theme: 'rightClick'
      });
      song.addEventListener('contextmenu', (event) => {
          console.log('right clicked')
        event.preventDefault();
      
        instance.setProps({
          getReferenceClientRect: () => ({
            width: 0,
            height: 0,
            top: event.clientY,
            bottom: event.clientY,
            left: event.clientX,
            right: event.clientX,
          }),
        });
      
        instance.show();
      });

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
        ipcRenderer.send('gpUse', 'Start')
    } else if (gpuseval == 1) {
        gpuseval = 0
        document.getElementById('startGuestPicks').style = 'display: none;'
        document.getElementById('gpqueuediv').style = 'display: none;'
        q = []
        ipcRenderer.send('clearQueue')
        document.getElementById('useGuestPicks').value = 'USE'
        document.getElementById('gpcolumn').textContent = '';
        switchButton('start')
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
            document.getElementById('startGuestPicks').style = 'display: none;'
        document.getElementById('useGuestPicks').value = 'START'
        document.getElementById('gpqueuediv').style = 'display: none;'
            switchButton('start')
        }
    } else if (switchto == 'start') {
        gpStartButton.value = 'START'
        document.getElementById('useGuestPicks').value = 'UNHAND'
        gpStartButton.style.backgroundColor = 'rgb(24, 24, 24)'
        gpStartButton.onclick = function (event) {
            console.log(event);
            ipcRenderer.send('gpStart')
            switchButton('stop')

        }
    }
}

const sceneCardElements = document.querySelectorAll('.scene-card')
const songElements = document.querySelectorAll('.song')

sceneCardElements.forEach((sceneCardElement) => {
    const instance = tippy(sceneCardElement, {
        content: document.getElementById('sceneCardsRightClickMenuTemplate').innerHTML,
        placement: 'right-start',
        trigger: 'manual',
        interactive: true,
        arrow: false,
        offset: [0, 0],
        allowHTML: true,
        theme: 'rightClick'
      });
      sceneCardElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      
        instance.setProps({
          getReferenceClientRect: () => ({
            width: 0,
            height: 0,
            top: event.clientY,
            bottom: event.clientY,
            left: event.clientX,
            right: event.clientX,
          }),
        });
      
        instance.show();
      });
})
