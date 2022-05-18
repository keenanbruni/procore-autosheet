const { app, BrowserWindow, ipcMain, dialog, session, DownloadItem } = require('electron')
try {
  require('electron-reloader')(module)
} catch (_) {}
const Store = require('electron-store')
const {download} = require("electron-dl")
const path = require('path')
const axios = require('axios')
require('dotenv').config()

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

// Electron Initialization
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

// Main functionality
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
  // win.removeMenu() - enable for production
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
          console.log(`ACCESS TOKEN: ${response.data.access_token}`)
          console.log(`REFRESH TOKEN: ${response.data.refresh_token}`)
          store.set('refresh-token', response.data.refresh_token)
          store.set('access-token', response.data.access_token)

          // Redirects to Dash
          win.loadFile('./dashboard.html')
        })
        .catch(function (error) {
          if (error) {
            dialog.showMessageBox(win, { message:"There has been a login error. Please restart the program and try again." })
            console.log(`AW CRAP! : ${error}`);
          }
        });

      // Upsize window
      let width = 1200;
      let height = 800;
      let animate = true;
      win.setSize(width, height, animate);

      // Critical error alert
      ipcMain.on('critical-error', (e, arg) => {
        dialog.showMessageBox(win, { message:"There has been a critical error. Please restart the program and try again." })
      })

      // Logout redirect
      ipcMain.on('logout', (e, arg) => {
        const params = { token: store.get('access-token'), client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, token_type_hint: 'access_token' }
        axios.post('https://api.procore.com/oauth/revoke', params)
          .then(function (response){
            if(response.status == 200){
              store.set('access-token', ""); store.set('refresh-token', ""); authCodeData.refresh_token = ""; authCodeData.code = "";
              session.defaultSession.clearStorageData([], (data) => {})
              // Downsize window
              let width = 720; let height = 720; let animate = true;
              win.setSize(width, height, animate);
              win.loadFile('./login.html')
            }
          }
          )
          .catch(function (error) {
            dialog.showMessageBox(win, { message:"There has been a logout error. Please restart the program and try again." });
          });
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

// Terminal Logger
ipcMain.on('logger', (event, arg) => {
  console.log(arg) // prints message
})

