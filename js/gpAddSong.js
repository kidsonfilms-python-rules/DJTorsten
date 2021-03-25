const electron = require('electron')
const remote = electron.remote;
const ipcRenderer = require('electron').ipcRenderer;

const input = document.getElementById('addSong')
var songList = []

input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        if (input.value == '') {
            alert('Text box is Empty!')
            return 'Textbox Empty!'
        }

        for (i in songList) {
            if (input.value == songList[i]) {
                alert('This Link is a Duplicate!\nWe Do Not Support Duplicate Links At The Moment')
                input.value = ''
                return 'Duplicate Link'
            }
        }
        const ul = document.getElementById('songList')
        const song = document.createElement("div")
        const songname = document.createElement("p")
        const xicon = document.createElement("i")
        xicon.className = 'fas fa-times-circle'
        const val = input.value
        songList.push(input.value)
        xicon.onclick = () => {
            for (var i in songList) {
                if (songList[i] == val) {
                    console.log('FOUND A MATCH')
                    console.log(i)
                    songList.splice(i, 1)
                    song.remove()
                }
            }
        }
        song.className = 'song'
        songname.innerHTML = input.value.replace('https://', '').replace('www.', '').split('&')[0]
        song.appendChild(xicon)
        song.appendChild(songname)
        ul.appendChild(song)
        input.value = ''
    }
});

const closeButton = document.getElementById('close')
const thisWindow = remote.getCurrentWindow()

closeButton.onclick = () => {
    thisWindow.close()
}

const doneButton = document.getElementById('done')

doneButton.onclick = () => {
    if (songList == []) {
        if (input.val.replace(' ', '') == '') {
            if (input.val.contains('youtube.com')) {
                songList.push(input.val)
            } else {
                alert('The link provided it not a YouTube link')
            }
        }
        return thisWindow.close()
    }
    ipcRenderer.send('gpAddSong', songList)
    thisWindow.close()
}