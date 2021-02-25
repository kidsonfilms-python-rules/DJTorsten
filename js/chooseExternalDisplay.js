const electron = require('electron')
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
const desktopCapturer = electron.desktopCapturer;

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ['screen']
    })

    var listwidget = document.getElementById('displayList')
    inputSources.forEach((d) => {
        var dchoice = document.createElement('div')
        dchoice.onclick = () => {
            ipcRenderer.send('choiceExternalDisplay', d.display_id)
            thisWindow.close()
        }
        dchoice.className = 'display'
        var dchoicelabel = document.createElement('p')
        dchoicelabel.innerText = d.name
        var thumbnail = document.createElement('img')
        console.log(d.thumbnail.toJPEG(1000))
        thumbnail.src = d.thumbnail.toDataURL().toString()
        dchoice.appendChild(thumbnail)
        dchoice.appendChild(dchoicelabel)
        listwidget.appendChild(dchoice)
    })
}

getVideoSources()

const closeButton = document.getElementById('close')
const thisWindow = remote.getCurrentWindow()

closeButton.onclick = () => {
    thisWindow.close()
}