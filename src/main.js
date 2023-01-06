const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const AppConfig = require('./configuration.js')

function createWindow () {
  // restore window bounds
  const savedBounds = AppConfig.readSettings('bounds')
  const bounds = savedBounds ?? {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
  }
  
  bounds.webPreferences = {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: true,
    contextIsolation: false,
  }
  const win = new BrowserWindow(bounds)

  // win.setResizable(false);

  win.webContents.openDevTools()

  win.loadFile('./src/views/index.html')

  // save position when close
  win.on('close', () => {
    let winBounds = win.getBounds();
    AppConfig.saveSettings('bounds', winBounds)
  })
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:SelectFolder', openFolderDialog)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// open folder dialog
async function openFolderDialog() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (canceled) return 
  else return filePaths[0]
}