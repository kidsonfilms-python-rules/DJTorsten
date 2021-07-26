const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow
const onChange = require('on-change');
var fs = require('fs');
const path = require('path');

ipcRenderer.invoke('getAppDataPath', 'fileName.txt').then((result) => {
    const outPath = (process.platform == 'win32' || process.platform == 'linux') ? `${result}/.djflame/music/` : `${__dirname}/music/`
    var files = fs.readdirSync(outPath);
    console.log(files)

    const clearCacheButton = document.getElementById('clearMusicCacheGPButton')
    console.log(files)
    if (files.length == 0) {
        clearCacheButton.disabled = true;
        tippy('#clearCacheProxy', {
            duration: 0,
            arrow: true,
            content: 'Cache is Clear!',
            offset: [0, -265],
            inertia: true,
            animation: 'perspective',
        });
    }

    var directory = 'music'

    clearCacheButton.addEventListener('click', () => {
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
                clearCacheButton.disabled = true;
                tippy('#clearCacheProxy', {
                    duration: 0,
                    arrow: true,
                    content: 'Cache is Clear!',
                    offset: [0, -1000],
                    inertia: true,
                    animation: 'perspective',
                });
            });
        }
    })
});

// const fi = files.indexOf('Rick Astley - Never Gonna Give You Up (Video).mp3');
// if (fi > -1) {
//   files.splice(fi, 1);
// }



var savedData;
var currentData;

ipcRenderer.send('requestSceneSettings', '')
ipcRenderer.on('requestedSceneSettings', (e, sceneSettings) => {
    console.log(sceneSettings)
    savedData = JSON.parse(JSON.stringify(sceneSettings));
    currentData = JSON.parse(JSON.stringify(sceneSettings));

    var unsavedModal = document.getElementById('unsavedModal')


    var guestPicksToggle = document.getElementById('guestPicks')
    var karaokeToggle = document.getElementById('karaoke')
    var externalDisplayToggle = document.getElementById('externalDisplayToggle')
    var setTimeRadio = document.getElementById('setTime-option')
    var randomTimeRadio = document.getElementById('randomTime-option')
    var toText = document.getElementById('toText')
    var range2 = document.getElementById('number-2')
    var range1 = document.getElementById('number-1')

    if (savedData.general.guestPicks) {
        guestPicksToggle.checked = true
    }
    if (savedData.general.karaoke) {
        karaokeToggle.checked = true
    }
    if (savedData.guestPicks.externalDisplay) {
        externalDisplayToggle.checked = true
        externalDisplayButton.style.display = 'block'
    }
    if (savedData.guestPicks.songLength.random) {
        randomTimeRadio.checked = true
        toText.style.display = 'inline-block'
        range2.style.display = 'inline-block'
        range1.value = savedData.guestPicks.songLength.range1
        range2.value = savedData.guestPicks.songLength.range2
    } else if (!savedData.guestPicks.songLength.random) {
        setTimeRadio.checked = true
        toText.style.display = 'none'
        range2.style.display = 'none'
        range1.value = savedData.guestPicks.songLength.range1
        range2.value = savedData.guestPicks.songLength.range2
    }
})


var resetButton = document.getElementById('resetSettings')
var saveButton = document.getElementById('saveSettings')
var externalDisplayButton = document.getElementById('externalDisplayButton')
var guestPicksToggle = document.getElementById('guestPicks')
var karaokeToggle = document.getElementById('karaoke')
var externalDisplayToggle = document.getElementById('externalDisplayToggle')
var setTimeRadio = document.getElementById('setTime-option')
var randomTimeRadio = document.getElementById('randomTime-option')
var toText = document.getElementById('toText')
var range2 = document.getElementById('number-2')
var range1 = document.getElementById('number-1')

// var savedData = {
//     general: {
//         guestPicks: true,
//         karaoke: false
//     },
//     guestPicks: {
//         externalDisplay: true,
//         songLength: {
//             random: false,
//             range1: 22,
//             range2: 22,
//         }
//     }
// }

resetButton.addEventListener("click", () => {
    currentData = {
        general: {
            guestPicks: savedData.general.guestPicks,
            karaoke: savedData.general.karaoke
        },
        guestPicks: {
            externalDisplay: savedData.guestPicks.externalDisplay,
            songLength: {
                random: savedData.guestPicks.songLength.random,
                range1: savedData.guestPicks.songLength.range1,
                range2: savedData.guestPicks.songLength.range2,
            }
        }
    }
    if (savedData.general.guestPicks) {
        guestPicksToggle.checked = true
    } else {
        guestPicksToggle.checked = false
    }
    if (savedData.general.karaoke) {
        karaokeToggle.checked = true
    } else {
        karaokeToggle.checked = false
    }
    if (savedData.guestPicks.externalDisplay) {
        externalDisplayToggle.checked = true
    } else {
        externalDisplayToggle.checked = false
    }
    if (savedData.guestPicks.songLength.random) {
        randomTimeRadio.checked = true
        toText.style.display = 'inline-block'
        range2.style.display = 'inline-block'
        range1.value = savedData.guestPicks.songLength.range1
        range2.value = savedData.guestPicks.songLength.range2
    } else if (!savedData.guestPicks.songLength.random) {
        setTimeRadio.checked = true
        toText.style.display = 'none'
        range2.style.display = 'none'
        range1.value = savedData.guestPicks.songLength.range1
        range2.value = savedData.guestPicks.songLength.range2
    }
    unsavedModal.style.display = 'none'
    unsavedModal.style.visibility = 'hidden'
})

saveButton.addEventListener("click", () => {
    savedData = {
        general: {
            guestPicks: currentData.general.guestPicks,
            karaoke: currentData.general.karaoke
        },
        guestPicks: {
            externalDisplay: currentData.guestPicks.externalDisplay,
            songLength: {
                random: currentData.guestPicks.songLength.random,
                range1: currentData.guestPicks.songLength.range1,
                range2: currentData.guestPicks.songLength.range2,
            }
        }
    }
    unsavedModal.style.display = 'none'
    unsavedModal.style.visibility = 'hidden'
    ipcRenderer.send('sceneSettingsChange', savedData)
})

document.addEventListener("keydown", function (e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 83) {
        e.preventDefault();
        // Process the event here (such as click on submit button)
        savedData = {
            general: {
                guestPicks: currentData.general.guestPicks,
                karaoke: currentData.general.karaoke
            },
            guestPicks: {
                externalDisplay: currentData.guestPicks.externalDisplay,
                songLength: {
                    random: currentData.guestPicks.songLength.random,
                    range1: currentData.guestPicks.songLength.range1,
                    range2: currentData.guestPicks.songLength.range2,
                }
            }
        }
        unsavedModal.style.display = 'none'
        unsavedModal.style.visibility = 'hidden'
    }
}, false);


externalDisplayToggle.addEventListener('change', (e) => {
    currentData.guestPicks.externalDisplay = externalDisplayToggle.checked
    if (externalDisplayToggle.checked) {
        externalDisplayButton.style.display = 'block'
    } else {
        externalDisplayButton.style.display = 'none'
    }

    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
        unsavedModal.style.visibility = 'hidden'
    } else {
        unsavedModal.style.display = 'flex'
        unsavedModal.style.visibility = 'visible'
    }
})

var externalDisplayChoiceWindow = null

externalDisplayButton.addEventListener('click', (e) => {
    if (externalDisplayChoiceWindow) {
        externalDisplayChoiceWindow.focus()
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
            devTools: true
        },
        alwaysOnTop: true,
        show: false,
    }
    externalDisplayChoiceWindow = new BrowserWindow(winSettings);
    externalDisplayChoiceWindow.loadURL(`file://${__dirname}/windows/chooseExternalDisplay.html`)

    externalDisplayChoiceWindow.show()

    externalDisplayChoiceWindow.on('closed', function () {
        externalDisplayChoiceWindow = null
    })
})



setTimeRadio.addEventListener('click', () => {
    toText.style.display = 'none'
    range2.style.display = 'none'
    currentData.guestPicks.songLength.random = false
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
        unsavedModal.style.visibility = 'hidden'
    } else {
        unsavedModal.style.display = 'flex'
        unsavedModal.style.visibility = 'visible'
    }
})

randomTimeRadio.addEventListener('click', () => {
    toText.style.display = 'inline-block'
    range2.style.display = 'inline-block'
    currentData.guestPicks.songLength.random = true
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
        unsavedModal.style.visibility = 'hidden'
    } else {
        unsavedModal.style.display = 'flex'
        unsavedModal.style.visibility = 'visible'
    }
})

range1.addEventListener('change', () => {
    currentData.guestPicks.songLength.range1 = parseInt(range1.value, 10)
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
        unsavedModal.style.visibility = 'hidden'
    } else {
        unsavedModal.style.display = 'flex'
        unsavedModal.style.visibility = 'visible'
    }
})
range2.addEventListener('change', () => {
    currentData.guestPicks.songLength.range2 = parseInt(range2.value, 10)
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
        unsavedModal.style.visibility = 'hidden'
    } else {
        unsavedModal.style.display = 'flex'
        unsavedModal.style.visibility = 'visible'
    }
})

guestPicksToggle.addEventListener('change', () => {
    currentData.general.guestPicks = guestPicksToggle.checked
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
        unsavedModal.style.visibility = 'hidden'
    } else {
        unsavedModal.style.display = 'flex'
        unsavedModal.style.visibility = 'visible'
    }
})
// karaokeToggle.addEventListener('change', () => {
//     currentData.general.karaoke = karaokeToggle.checked
//     if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
//         unsavedModal.style.display = 'none'
//         unsavedModal.style.visibility = 'hidden'
//     } else {
//         unsavedModal.style.display = 'flex'
//         unsavedModal.style.visibility = 'visible'
//     }
// })

const shareButton = document.getElementById('shareButton');
const sendButton = document.querySelector('.shareModal__submit');
const modal = document.getElementById('share-modal')

shareButton.addEventListener('click', () => {
    modal.classList.toggle('share-modal--open');
    console.log(modal)
    modal.classList.toggle('share-modal--close');

})

var getHTML = function (url, callback) {

    // Feature detection
    if (!window.XMLHttpRequest) return;

    // Create new request
    var xhr = new XMLHttpRequest();

    // Setup callback
    xhr.onload = function () {
        if (callback && typeof (callback) === 'function') {
            callback(this.responseXML);
        }
    }

    // Get the HTML
    xhr.open('GET', url);
    xhr.responseType = 'document';
    xhr.send();

};



function shareTwitter() {
    electron.shell.openExternal("http://twitter.com/share?text=Join My DJFlame Party! The Party Code is 053467&url=http://github.com&hashtags=djflame,party,partyatmyplace")
}

function shareFacebook() {
    electron.shell.openExternal('http://www.facebook.com/sharer.php?u=https%3A%2F%2Fgithub.com')
}

function shareReddit() {
    electron.shell.openExternal("http://www.reddit.com/submit?title=Join%20My%20DJFlame%20Party!&text=The%20Party%20Code%20is:%20**053467**%20or%20Use%20(this%20Link)[https://github.com]!")
}

function sharePrint() {
    getHTML(`${__dirname}/windows/sharePrint.html`, function (response) {
        var element = response.documentElement
        html2pdf(element);
    });
}

document.getElementById("clickToCopyShareURL").onclick = function () {
    this.select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    document.getElementById("clickToCopyShareURL").style.backgroundColor = '#00b530'
    setTimeout(() => {
        document.getElementById("clickToCopyShareURL").style.backgroundColor = 'transparent'
    }, 1000);
}

ipcRenderer.send('requestPartyCode')
ipcRenderer.on('requestedPartyCode', (err, code) => {
    document.getElementById('partyCodeText').value = code
    document.getElementById("clickToCopyShareURL").value = `https://djflame.tech/join?c=${code}`
})
document.getElementById("clickToCopyShareURL").addEventListener('select', function () {
    this.selectionStart = this.selectionEnd;
}, false);

$('#share-modal').on('click', function (e) {
    if (e.target !== e.currentTarget)
        return;

    modal.classList.toggle('share-modal--open');
    console.log(modal)
    modal.classList.toggle('share-modal--close');
});