const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const AppConfig = require('./configuration.js')
const prompt = require('electron-prompt')
const $ = require('jquery')
const { resolve } = require('path')

function createWindow () {
  // restore window bounds
  const savedBounds = AppConfig.readSettings('bounds')
  const bounds = savedBounds ?? {
    width: 1080,
    height: 600,
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
    const winBounds = win.getBounds();
    AppConfig.saveSettings('bounds', winBounds)
  })
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:SelectFolder', openFolderDialog)
  ipcMain.handle('dialog:EditDescription', (event, args) => openDescriptionDialog(args))

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

async function openDescriptionDialog(args) {
  const language = AppConfig.readSettings('language')
  const locale = require(`./locales/${language}.json`)

  const description = await prompt({
    title: locale.titles.editDesc,
    label: '',
    value: args.savedDescription ?? '',
    inputAttrs: {
        type: 'text',
    },
    type: 'input',
    resizable: false,
    alwaysOnTop: true,
    buttonLabels: {
      "ok": locale.buttons.confirm,
      "cancel": locale.buttons.cancel
    }
  })

  return description
}