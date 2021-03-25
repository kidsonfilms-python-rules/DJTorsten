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
var invalidEmail = document.getElementById('invalidEmail')
var invalidPassword = document.getElementById('invalidPassword')
var passwordInput = document.getElementById("signinpassword")
element.onclick = function (event) {
  console.log(event);
  signin(emailInput.value, passwordInput.value)
}

ipc.on('auth/invalidEmail', () => {
    emailInput.classList.add('invalid')
    invalidEmail.style.opacity = '1'
    invalidEmail.innerText = 'The Email is Invalid.'
    emailInput.addEventListener('keypress', () => {
      emailInput.classList.remove('invalid')
    invalidEmail.style.opacity = '0'
    invalidEmail.innerText = 'No Error'
    })
})

ipc.on('auth/userNotFound', () => {
  emailInput.classList.add('invalid')
    invalidEmail.style.opacity = '1'
    invalidEmail.innerHTML = 'This Email is not a registered user, <a href="">Sign Up first on our website.</a>'
    emailInput.addEventListener('keypress', () => {
      emailInput.classList.remove('invalid')
    invalidEmail.style.opacity = '0'
    invalidEmail.innerHTML = 'No Error'
    })
})

ipc.on('auth/wrongPassword', () => {
  passwordInput.classList.add('invalid')
    invalidPassword.style.opacity = '1'
    invalidPassword.innerText = 'You entered the wrong password, try again'
    passwordInput.addEventListener('keypress', () => {
      passwordInput.classList.remove('invalid')
    invalidPassword.style.opacity = '0'
    invalidPassword.innerText = 'No Error'
    })
})

ipc.on('auth/unknownError', () => {
  passwordInput.classList.add('invalid')
    invalidPassword.style.opacity = '1'
    invalidPassword.innerHTML = 'Unknown Error, try again. If that does not work, <a href="">Contact Us</a>'
    emailInput.classList.add('invalid')
    invalidEmail.style.opacity = '1'
    invalidEmail.innerHTML = 'Unknown Error, try again. If that does not work, <a href="">Contact Us</a>'
    passwordInput.addEventListener('keypress', () => {
      passwordInput.classList.remove('invalid')
    invalidPassword.style.opacity = '0'
    invalidPassword.innerHTML = 'No Error'
    })
    emailInput.addEventListener('keypress', () => {
      emailInput.classList.remove('invalid')
    invalidEmail.style.opacity = '0'
    invalidEmail.innerHTML = 'No Error'
    })
})