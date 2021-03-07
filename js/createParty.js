const { ipcRenderer } = require("electron");

function createParty() {
  window.location.replace("index.html");
}

var element = document.getElementById("submit");
element.onclick = function (event) {
  console.log(event);
  createParty()
}

function joinLast() {
  ipcRenderer.send('joinLastParty')
  ipcRenderer.on('joinLastPartyCallback', (e, d) => {
    if (d) {
      window.location.replace("index.html");
    } else {
      console.log('Last Party Has Expired!')
    }
  })
}

var joinLastElement = document.getElementById('joinLast')
joinLastElement.onclick = () => {
  joinLast()
}