const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      path: electronPath,

      // Assuming you have the following directory structure

      //  |__ my project
      //     |__ ...
      //     |__ main.js
      //     |__ package.json
      //     |__ index.html
      //     |__ ...
      //     |__ test
      //        |__ spec.js  <- You are here! ~ Well you should be.

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, '..')]
    })
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('Launches Main Window and Canary Engine Window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.strictEqual(count, 2)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })
  it('Passes Pre-Start and Moves to Login Page', function () {
    this.timeout(5000)
      return this.app.client.$("p").then(function (element) {
        element.getText().then((text) => {
            assert.strictEqual(text, 'Sign to start a party.')
        })
        // Please note that getWindowCount() will return 2 if `dev tools` are opened.
        // assert.equal(count, 2)
      })
  })
  
  it('Signs In Using Unit Testing Account', function () {
      this.timeout(5000)
      return this.app.client.$("#signinemail").then((emailInput) => {
          this.app.client.$("#signinpassword").then((passinput) => {
              this.app.client.$('#submit').then((submitButton) => {
                  emailInput.value = 'unit-tests@djflame.tech'
                  passinput.value = "unitTesting1423452"
                  submitButton.trigger('click')
                  this.timeout(10000)
              })
          })
      })
  })
})