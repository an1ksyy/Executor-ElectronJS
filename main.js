const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')

const PREMIUM_KEYS = [
  "EDGY-VALO-2024-ALPHA",
  "EDGY-VALO-2024-BETA",
  "EDGY-VALO-2024-GAMMA"
];

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 900,
    minHeight: 600,
    maxWidth: 900,
    maxHeight: 600,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  ipcMain.handle('validate-key', (event, key) => {
    return PREMIUM_KEYS.includes(key);
  });
  ipcMain.handle('attach-hack', () => {
    // Placeholder for hack logic
    // In real use, this would inject or attach to Valorant process
    return true;
  });
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