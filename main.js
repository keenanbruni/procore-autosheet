const { app, BrowserWindow, ipcMain, dialog } = require('electron')
try {
  require('electron-reloader')(module)
} catch (_) {}
const Store = require('electron-store')
const {download} = require("electron-dl");
const path = require('path')
const axios = require('axios')

// Initial declarations
const store = new Store();
let accessCode = ""
let refreshToken = ""
let authCodeData = {
  "grant_type": "authorization_code",
  "client_id": "c54c7efb485fd98f2d4e144cdf42e98e40dbec9f673e4a0e88b5960fe78d4161",
  "client_secret": "0599d47b0df5b56991e8d7ad14152511711b22c8ac68a37d885555a7a0f95f59",
  "code": accessCode,
  "redirect_uri": "https://login.procore.com/",
  "refresh_token": refreshToken
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Main browser window 
function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.setMenuBarVisibility(false)
  win.loadFile('./login.html')

  // Intercepts redirect URI, extracts code, & sends to dashboard. 
  win.webContents.on('will-redirect', (e, url) => {
    if (url.indexOf("code=") != -1) {
      e.preventDefault()
      accessCode = url.split('=')[1]
      authCodeData.code = accessCode
      console.log(`ACCESS CODE: ${url.split('=')[1]}`)

      // Gets Auth & Redirect Token 
      axios.post('https://login.procore.com/oauth/token', authCodeData)
        .then(function (response) {
          authCodeData.refreshToken = response.data.refresh_token
          console.log(`ACCESS TOKEN: ${response.data.access_token}`);
          console.log(`REFRESH TOKEN: ${response.data.refresh_token}`)
          store.set('refresh-token', response.data.refresh_token)
          store.set('access-token', response.data.access_token)
          store.set('client-id', authCodeData.client_id)
          store.set('client-secret', authCodeData.client_secret)
        })
        .catch(function (error) {
          console.log(`AW CRAP! : ${error}`);
        });

      // Redirects to Dash
      win.loadFile('./dashboard.html')
      // Upsize window
      let width = 1200;
      let height = 800;
      let animate = true;
      win.setSize(width, height, animate);

      // Logout redirect
      ipcMain.on('logout', (e, arg) => {
        win.loadFile('./login.html')
      })
    }
  })

  // Handles electron-dl downloads
  ipcMain.on("download", (event, info) => {
    download(BrowserWindow.getFocusedWindow(), info.url, info.options)
      .then(dl => win.webContents.send("download complete", dl.getSavePath()));
  });

  // Sets save location
  ipcMain.on('save-location', (e, arg) => {
    dialog.showOpenDialog({ properties: ['openDirectory'] })
      .then((result) => {
        win.webContents.send("saved-location", result.filePaths)
      })
  })
}

// Messaging
ipcMain.on('renew-lease', (e, arg) => {
  axios.post('https://login.procore.com/oauth/token', {
    client_id: authCodeData.client_id,
    client_secret: authCodeData.client_secret,
    code: accessCode,
    grant_type: "refresh_token",
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    refresh_token: refreshToken,

  }).then(function (response){
    authCodeData.refreshToken = response.data.refresh_token
    console.log(`ACCESS TOKEN: ${response.data.access_token}`);
    console.log(`REFRESH TOKEN: ${response.data.refresh_token}`)
    store.set('refresh-token', response.data.refresh_token)
    store.set('access-token', response.data.access_token)
    store.set('client-id', authCodeData.client_id)
    store.set('client-secret', authCodeData.client_secret)
  })
})

// Terminal Logger
ipcMain.on('logger', (event, arg) => {
  console.log(arg) // prints message
})

