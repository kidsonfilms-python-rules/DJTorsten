const fs = require('fs');
const path = require('path');
var electron_notarize = require('electron-notarize');
const config = require('../package.json')
require('dotenv').config();
module.exports = async function (params) {
  // Only notarize the app on Mac OS only.  
  if (process.platform !== 'darwin' || path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`) == '/Users/siddharth/dev/DJTorsten/dist/win-unpacked/DJFlame.app') {
    return;
  }
  // Same appId in electron-builder.  
  let appId = config.build.appId
  let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }
  const startNoteTime = new Date()
  console.log(`Notarizing ${appId} found at ${appPath}. Started Notarizing at ${new Date().toLocaleTimeString()}, expected max finish time ${new Date(new Date().getTime() + 350*1000).toLocaleTimeString()}`);
  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID, // this is your apple ID it should be stored in an .env file  
      appleIdPassword: process.env.APPLE_ID_PASSWORD, // this is NOT your apple ID password. You need to   
      //create an application specific password from https://appleid.apple.com under "security" you can generate  
      //such a password   
      //   ascProvider: process.env.appleIdProvider // this is only needed if you have multiple developer  
      // profiles linked to your apple ID.   
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
  console.log(`Done notarizing ${appId}! Time Finished: ${new Date().toLocaleTimeString()}, Time Elasped: ${Math.floor(new Date() / 1000) - Math.floor(startNoteTime / 1000)}s`);
};