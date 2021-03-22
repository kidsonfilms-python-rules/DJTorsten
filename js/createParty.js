const { ipcRenderer } = require("electron");

function createParty() {
  window.location.replace("index.html");
}

function checkInternet(cb) {
  require('dns').lookup('google.com', function (err) {
      if (err && err.code == "ENOTFOUND") {
          cb(false);
      } else {
          cb(true);
      }
  })
}
window.addEventListener('offline', () => checkInternet((r) => {
  if (!r) {
    window.location.replace("loading.html?redirect=createParty.html")
  }
}))
checkInternet((r) => {
  if (!r) {
    window.location.replace("loading.html?redirect=createParty.html")
  }
})

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