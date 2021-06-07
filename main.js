const { app, BrowserWindow, ipcMain } = require('electron')
try {
  require('electron-reloader')(module)
} catch (_) {}
const Store = require('electron-store')
const path = require('path')
const axios = require('axios')

// Initial declarations
const store = new Store();
let accessCode = ""
let refreshToken = ""
let authCodeData = {
  "grant_type": "authorization_code",
  "client_id": "9a8c0016b5081cfcee493d0fbb65a4f29609b134e40e18b356d4394b362d17e8",
  "client_secret": "d7abc979c9b5c2b563169205a05cfec639c955bcbc5a8f42ecdcce0492b14ecb",
  "code": accessCode,
  "redirect_uri": "https://login-sandbox.procore.com/",
  "refresh_token": refreshToken
}

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

  win.loadFile('./src/login.html')

  // Intercepts redirect URI, extracts code, & sends to dashboard. 
  win.webContents.on('will-redirect', (e, url) => {
    if (url.indexOf("code=") != -1) {
      e.preventDefault()
      accessCode = url.split('=')[1]
      authCodeData.code = accessCode
      console.log(`ACCESS CODE: ${url.split('=')[1]}`)

      // Gets Auth & Redirect Token 
      axios.post('https://login-sandbox.procore.com/oauth/token', authCodeData)
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
      win.loadFile('./src/dashboard.html')
    }
  })
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

// Messaging
ipcMain.on('renew-lease', (e, arg) => {
  axios.post('https://login-sandbox.procore.com/oauth/token', {
    refresh_token: authCodeData.refresh_token,
    client_id: authCodeData.client_id,
    client_secret: authCodeData.client_secret,
    grant_type: 'refresh_token'
  }).then(function (response){
    authCodeData.refreshToken = response.data.refresh_token
    console.log(`UPDATED ACCESS TOKEN: ${response.data.access_token}`);
    console.log(`UPDATED REFRESH TOKEN: ${response.data.refresh_token}`)
    store.set('refresh-token', response.data.refresh_token)
    store.set('access-token', response.data.access_token)
  })
})