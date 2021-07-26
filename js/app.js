// Import All Packages
//--------------------
// General Packages
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow
const $ = require('jquery')
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
  constructor(url, probarDiv, docName, info, explicit) {
    this.url = url
    this.progressDiv = probarDiv
    this.docName = docName
    this.info = info
    this.explicit = explicit
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
        const songObj = new Song(url, probar, docName, { title: "--" }, data.explicit)
        q.push(songObj)

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
        if (parseInt(docName) < parseInt(q[q.length - 1].docName)) {
          q.sort(function (a, b) {
            return parseInt(a.docName) - parseInt(b.docName);
          });
          var docNameQ = []
          for (song in q) {
            if (parseInt(q[song].docName) < parseInt(docName)) {
              docNameQ.push(parseInt(q[song].docName))
            }
          }
          console.log(docNameQ)
          docNameQ.sort(function (a, b) {
            return a - b;
          });
          console.log(q)

          document.querySelector(`#song-${docNameQ[docNameQ.length - 1]}`).insertAdjacentHTML('afterend', `<div class="song" id="song-${docName}">${song.innerHTML}</div>`);
        } else {
          main.appendChild(song)
        }

        q.sort(function (a, b) {
          return parseInt(a.docName) - parseInt(b.docName);
        });

        $("#gpcolumn .song").sort(function (a, b) {
          return parseInt(a.id.replace('song-', '')) - parseInt(b.id.replace('song-', ''));
        }).each(function () {
          var elem = $(this);
          elem.remove();
          $(elem).appendTo("#gpcolumn");
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
        songname.innerText = vidTitle.replace('[DJFlame EXPLICIT]', '') + (songObj.explicit ? ' [DJFlame EXPLICIT]' : '');
        songObj.info = videoInfo

        document.getElementById('deleteSongElement').onclick = () => { ipcRenderer.send('gpDeleteSong', docName); song.remove() }
        const instance = tippy(song, {
          // content: document.getElementById('songCardsRightClickMenuTemplate').innerHTML,
          content: `<div id="songCardsRightClickMenuTemplate">
                    <div class="menuItem dangerMenuItem">
                      <a onclick="ipcRenderer.send('gpDeleteSong', '${docName}'); document.getElementById('song-${docName}').remove();" id="deleteSongElement" class="dangerMenuText">Delete</a>
                    </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="MicroModal.show('modal-1');">Report Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="MicroModal.show('modal-1');">Report User</a>
                      </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="">Rate Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="ipcRenderer.send('canaryHeartSong', '${v}')">Favorite Song</a>
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
      audioPlayerContainer.style.display = 'block';
      audioPlayerContainer.style.visibility = 'visible';
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
  const songObj = new Song(url, probar, docName, { title: '--' }, data.explicit)
  q.push(songObj)

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
  if (parseInt(docName) < parseInt(q[q.length - 1].docName)) {
    q.sort(function (a, b) {
      return parseInt(a.docName) - parseInt(b.docName);
    });
    var docNameQ = []
    for (song in q) {
      if (parseInt(q[song].docName) < parseInt(docName)) {
        docNameQ.push(parseInt(q[song].docName))
      }
    }
    console.log(docNameQ)
    docNameQ.sort(function (a, b) {
      return a - b;
    });
    console.log(q)

    document.querySelector(`#song-${docNameQ[docNameQ.length - 1]}`).insertAdjacentHTML('afterend', `<div class="song" id="song-${docName}">${song.innerHTML}</div>`);
  } else {
    main.appendChild(song)
  }
  q.sort(function (a, b) {
    return parseInt(a.docName) - parseInt(b.docName);
  });
  $("#gpcolumn .song").sort(function (a, b) {
    return parseInt(a.id.replace('song-', '')) - parseInt(b.id.replace('song-', ''));
  }).each(function () {
    var elem = $(this);
    elem.remove();
    $(elem).appendTo("#gpcolumn");
  });

  var vidRaw = `?${url.split('?')[1]}`
  var v = new URLSearchParams(vidRaw).get('v');

  document.getElementById('deleteSongElement').onclick = () => { ipcRenderer.send('gpDeleteSong', docName); song.remove() }
  const instance = tippy(song, {
    // content: document.getElementById('songCardsRightClickMenuTemplate').innerHTML,
    content: `<div id="songCardsRightClickMenuTemplate">
                    <div class="menuItem dangerMenuItem">
                      <a onclick="ipcRenderer.send('gpDeleteSong', '${docName}'); document.getElementById('song-${docName}').remove();" id="deleteSongElement" class="dangerMenuText">Delete</a>
                    </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="MicroModal.show('modal-1');">Report Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="MicroModal.show('modal-1');">Report User</a>
                      </div>
                      <div class="rightClickMenuSeperator"></div>
                      <div class="menuItem">
                        <a onclick="">Rate Song</a>
                      </div>
                      <div class="menuItem">
                        <a onclick="ipcRenderer.send('canaryHeartSong', '${v}')">Favorite Song</a>
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



  var videoInfo = await yts({ videoId: v })
  // yt.retrieve(v, function (err, videoInfo) {
  //     if (err) throw err
  //     vidTitle = videoInfo.title
  //     console.log(videoInfo)
  //     songname.innerText = vidTitle;
  // })
  vidTitle = videoInfo.title.replace('[DJFlame EXPLICIT]', '') + (data.explicit ? '  [DJFlame EXPLICIT]' : '')
  console.log(videoInfo)
  songname.innerText = vidTitle;
  songObj.info = videoInfo
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
      audioPlayerContainer.style.display = 'none';
      audioPlayerContainer.style.visibility = 'none';
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

MicroModal.init();


// AUDIO CONTROLLER

var currentSong = null;

const playIconContainer = document.getElementById('playPauseButton');
const audioPlayerContainer = document.getElementById('audio-controller');
const seekSlider = document.getElementById('seek-slider');
const audioTime = document.getElementById('controller-time')
const skipIconContainer = document.getElementById('audioControllerSkip')
const heartIconContainer = document.getElementById('audioControllerHeart')
const reportIconContainer = document.getElementById('audioControllerReport')
const muteIconContainer = document.getElementById('audioControllerMute')
// const volumeSlider = document.getElementById('volume-slider');
// const muteIconContainer = document.getElementById('mute-icon');
let playState = 'pause';
let muteState = 'unmute';

// const playAnimation = lottieWeb.loadAnimation({
//   container: playIconContainer,
//   path: 'https://maxst.icons8.com/vue-static/landings/animated-icons/icons/pause/pause.json',
//   renderer: 'svg',
//   loop: false,
//   autoplay: false,
//   name: "Play Animation",
// });

// const muteAnimation = lottieWeb.loadAnimation({
//     container: muteIconContainer,
//     path: 'https://maxst.icons8.com/vue-static/landings/animated-icons/icons/mute/mute.json',
//     renderer: 'svg',
//     loop: false,
//     autoplay: false,
//     name: "Mute Animation",
// });

// playAnimation.goToAndStop(14, true);

playIconContainer.addEventListener('click', () => {
  if (playState === 'play') {
    playIconContainer.classList.toggle('fa-play')
    playIconContainer.classList.toggle('fa-pause')
    ipcRenderer.send('canaryPlay')
    playState = 'pause';
  } else {
    playIconContainer.classList.toggle('fa-play')
    playIconContainer.classList.toggle('fa-pause')
    ipcRenderer.send('canaryPause')
    playState = 'play';
  }
});

muteIconContainer.addEventListener('click', () => {
  if (muteState === 'mute') {
    muteIconContainer.classList.toggle('fa-volume')
    muteIconContainer.classList.toggle('fa-volume-mute')
    ipcRenderer.send('canaryMute', 0)
    muteState = 'unmute';
  } else {
    muteIconContainer.classList.toggle('fa-volume')
    muteIconContainer.classList.toggle('fa-volume-mute')
    ipcRenderer.send('canaryMute', 1)
    muteState = 'mute';
  }
});

skipIconContainer.addEventListener('click', () => {
  ipcRenderer.send('canarySkip')
})

heartIconContainer.addEventListener('click', () => {
  if (heartIconContainer.classList.contains('heartActive')) {
    heartIconContainer.classList.remove('heartActive');
    heartIconContainer.classList.remove('fas')
    heartIconContainer.classList.add('far')
    ipcRenderer.send('canaryHeartSong', currentSong.videoId)
  } else {
    heartIconContainer.classList.add('heartActive')
    heartIconContainer.classList.remove('far')
    heartIconContainer.classList.add('fas')
    ipcRenderer.send('canaryHeartSong', currentSong.videoId)
  }
})

// muteIconContainer.addEventListener('click', () => {
//     if(muteState === 'unmute') {
//         muteAnimation.playSegments([0, 15], true);
//         muteState = 'mute';
//     } else {
//         muteAnimation.playSegments([15, 25], true);
//         muteState = 'unmute';
//     }
// });

const showRangeProgress = (rangeInput) => {
  if (rangeInput === seekSlider) {
    audioPlayerContainer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
  } else {
    audioPlayerContainer.style.setProperty('--volume-before-width', rangeInput.value / rangeInput.max * 100 + '%');
  }
}

seekSlider.addEventListener('input', (e) => {
  showRangeProgress(e.target);
});

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? ":" : ":") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? ":" : ":") : "0:";
  var sDisplay = s > 0 ? s.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) : "00";
  return hDisplay + mDisplay + sDisplay;
}

ipcRenderer.on('canaryTimeChange', (e, d) => {
  console.log(d)
  seekSlider.value = d.percentage
  audioTime.innerText = `${secondsToHms(Math.trunc(d.seconds))} / ${secondsToHms(d.duration)}`
  showRangeProgress(seekSlider)
  var vidInfo = q[d.index].info
  currentSong = vidInfo

  const vidTitle = document.getElementById('audioControllerTitle')
  const vidSubHeading = document.getElementById('audioControllerSubHeading')
  const vidThumbnail = document.getElementById('audioControllerThumbnail')

  vidTitle.innerText = vidInfo.title
  vidSubHeading.innerText = `${q[d.index].explicit ? '🅴   ' : ''}${vidInfo.author.name} • DJ`
  vidThumbnail.src = vidInfo.thumbnail

  if (d.fav) {
    if (!heartIconContainer.classList.contains('heartActive')) {
      heartIconContainer.classList.add('heartActive')
      heartIconContainer.classList.remove('far')
      heartIconContainer.classList.add('fas')
    }
  } else {
    if (heartIconContainer.classList.contains('heartActive')) {
      heartIconContainer.classList.remove('heartActive');
      heartIconContainer.classList.remove('fas')
      heartIconContainer.classList.add('far')
    }
  }
})

// volumeSlider.addEventListener('input', (e) => {
//     showRangeProgress(e.target);
// });

const seekSliderHover = tippy(`#seek-slider`, {
  content: 'Moving the Slider will Stop Auto-Skip',
  placement: 'top',
  // trigger: 'manual',
  interactive: true,
  arrow: true,
  offset: [0, 0],
  allowHTML: true,
  theme: 'rightClick'
});

seekSlider.onchange = () => {
  console.log(`Moving Player to ${seekSlider.value}%`)
  ipcRenderer.send('canaryChangePlayHead', seekSlider.value)
}

ipcRenderer.on('canaryNewSong', () => {
  if (playState != 'pause') {
    playIconContainer.classList.toggle('fa-play')
    playIconContainer.classList.toggle('fa-pause')
    playState = 'pause';
  }

  audioPlayerContainer.style.display = 'block';
  audioPlayerContainer.style.visibility = 'visible';
})

Mousetrap.bind(['space'], function (e) {
  e.preventDefault()
  if (playState === 'play') {
    playIconContainer.classList.toggle('fa-play')
    playIconContainer.classList.toggle('fa-pause')
    ipcRenderer.send('canaryPlay')
    playState = 'pause';
  } else {
    playIconContainer.classList.toggle('fa-play')
    playIconContainer.classList.toggle('fa-pause')
    ipcRenderer.send('canaryPause')
    playState = 'play';
  }
});
Mousetrap.bind(['m'], function () {
  if (muteState === 'mute') {
    muteIconContainer.classList.toggle('fa-volume')
    muteIconContainer.classList.toggle('fa-volume-mute')
    ipcRenderer.send('canaryMute', 0)
    muteState = 'unmute';
  } else {
    muteIconContainer.classList.toggle('fa-volume')
    muteIconContainer.classList.toggle('fa-volume-mute')
    ipcRenderer.send('canaryMute', 1)
    muteState = 'mute';
  }
});
Mousetrap.bind(['f'], function () {
  if (heartIconContainer.classList.contains('heartActive')) {
    heartIconContainer.classList.remove('heartActive');
    heartIconContainer.classList.remove('fas')
    heartIconContainer.classList.add('far')
    ipcRenderer.send('canaryHeartSong', currentSong.videoId)
  } else {
    heartIconContainer.classList.add('heartActive')
    heartIconContainer.classList.remove('far')
    heartIconContainer.classList.add('fas')
    ipcRenderer.send('canaryHeartSong', currentSong.videoId)
  }
});
Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], function () {
  ipcRenderer.send('canarySkip')
});


