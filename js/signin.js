var ipc = require('electron').ipcRenderer

ipc.on('signInSuccess', () => {
  window.location.replace("createParty.html");
})

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
    window.location.replace("loading.html")
  }
}))
checkInternet((r) => {
  if (!r) {
    window.location.replace("loading.html")
  }
})


function signin(email, pass) {
    ipc.send('emailAuth', {
      email: email,
      pass: pass
    })
}

var element = document.getElementById("submit");
var emailInput = document.getElementById("signinemail")
var passwordInput = document.getElementById("signinpassword")
element.onclick = function(event) {
  console.log(event);
  signin(emailInput.value, passwordInput.value)
}