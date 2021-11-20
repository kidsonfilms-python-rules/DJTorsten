const electron = require('electron')
const remote = electron.remote;
const ipcRenderer = require('electron').ipcRenderer;
const path = require('path')

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
    if (songList.length == 0) {
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

const dialog = electron.remote.dialog;
const uploadFile = document.getElementById('upload');
  
uploadFile.addEventListener('click', () => {
    console.log('here')
        // Resolves to a Promise<Object>
        dialog.showOpenDialog({
            title: 'Select the Files to be uploaded',
            // defaultPath: __dirname,
            buttonLabel: 'Add Songs',
            // Restricting the user to only Text Files.
            filters: [
                {
                    name: 'Audio Files',
                    extensions: ['mp3', 'wav']
                }, ],
            // Specifying the File Selector Property
            properties: ['openFile', (process.platform == 'darwin' ? 'openDirectory' : ''), 'multiSelections']
        }).then(file => {
            // Stating whether dialog operation was
            // cancelled or not.
            console.log(file.canceled);
            if (!file.canceled) {
              file.filePaths.forEach((songFile) => {
                for (i in songList) {
                    if (input.value == songList[i]) {
                        alert('The File' + songFile.split('/')[-1] + ' has already been Added\nWe Do Not Support Duplicate Links At The Moment')
                        input.value = ''
                        return 'Duplicate File'
                    }
                }
                songList.push(songFile)
                const ul = document.getElementById('songList')
                const song = document.createElement("div")
                const songname = document.createElement("p")
                const xicon = document.createElement("i")
                xicon.className = 'fas fa-times-circle'
                const val = songFile
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
                songname.innerHTML = songFile.split('/').slice(-1)[0]
                song.appendChild(xicon)
                song.appendChild(songname)
                ul.appendChild(song)
                console.log(songFile)
                console.log(songFile.split('/').slice(-1)[0])
              })
            }  
        }).catch(err => {
            console.log(err)
        });
});