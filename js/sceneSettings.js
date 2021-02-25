const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow
const onChange = require('on-change');

var savedData = {
    general: {
        guestPicks: true,
        karaoke: false
    },
    guestPicks: {
        externalDisplay: true,
        songLength: {
            random: false,
            range1: 22,
            range2: 22,
        }
    }
}
var currentData = {
    general: {
        guestPicks: true,
        karaoke: false
    },
    guestPicks: {
        externalDisplay: true,
        songLength: {
            random: false,
            range1: 22,
            range2: 22,
        }
    }
}
var unsavedModal = document.getElementById('unsavedModal')


var guestPicksToggle = document.getElementById('guestPicks')
var karaokeToggle = document.getElementById('karaoke')
var externalDisplayToggle = document.getElementById('externalDisplayToggle')
var setTimeRadio = document.getElementById('setTime-option')
var randomTimeRadio = document.getElementById('randomTime-option')
var toText = document.getElementById('toText')
var range2 = document.getElementById('number-2')
var range1 = document.getElementById('number-1')
var resetButton = document.getElementById('resetSettings')
var saveButton = document.getElementById('saveSettings')

if (savedData.general.guestPicks) {
    guestPicksToggle.checked = true
}
if (savedData.general.karaoke) {
    karaokeToggle.checked = true
}
if (savedData.guestPicks.externalDisplay) {
    externalDisplayToggle.checked = true
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
})

document.addEventListener("keydown", function(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
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
    }
  }, false);

var externalDisplayButton = document.getElementById('externalDisplayButton')
externalDisplayToggle.addEventListener('change', (e) => {
    currentData.guestPicks.externalDisplay = externalDisplayToggle.checked
    if (externalDisplayToggle.checked) {
        externalDisplayButton.style.display = 'block'
    } else {
        externalDisplayButton.style.display = 'none'
    }

    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
    } else {
        unsavedModal.style.display = 'flex'
    }
})

var externalDisplayChoiceWindow = null

externalDisplayButton.addEventListener('click', (e) => {
    if (externalDisplayChoiceWindow) {
        externalDisplayChoiceWindow.focus()
        return
    }

    externalDisplayChoiceWindow = new BrowserWindow({
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
    } else {
        unsavedModal.style.display = 'flex'
    }
})

randomTimeRadio.addEventListener('click', () => {
    toText.style.display = 'inline-block'
    range2.style.display = 'inline-block'
    currentData.guestPicks.songLength.random = true
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
    } else {
        unsavedModal.style.display = 'flex'
    }
})

range1.addEventListener('change', () => {
    currentData.guestPicks.songLength.range1 = parseInt(range1.value, 10)
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
    } else {
        unsavedModal.style.display = 'flex'
    }
})
range2.addEventListener('change', () => {
    currentData.guestPicks.songLength.range2 = parseInt(range2.value, 10)
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
    } else {
        unsavedModal.style.display = 'flex'
    }
})

guestPicksToggle.addEventListener('change', () => {
    currentData.general.guestPicks = guestPicksToggle.checked
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
    } else {
        unsavedModal.style.display = 'flex'
    }
})
karaokeToggle.addEventListener('change', () => {
    currentData.general.karaoke = karaokeToggle.checked
    if (JSON.stringify(currentData) == JSON.stringify(savedData)) {
        unsavedModal.style.display = 'none'
    } else {
        unsavedModal.style.display = 'flex'
    }
})