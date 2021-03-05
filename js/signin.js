var ipc = require('electron').ipcRenderer

ipc.on('signInSuccess', () => {
  window.location.replace("createParty.html");
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