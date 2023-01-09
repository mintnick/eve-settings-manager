const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const AppConfig = require('./configuration.js')
const prompt = require('electron-prompt')
const $ = require('jquery')
const { getLocale } = require('./js/change-language')
const { overwrite } = require('./js/eve-folder')

let win, selectWin
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
  win = new BrowserWindow(bounds)

  // win.setResizable(false);

  win.webContents.openDevTools()

  win.loadFile('./src/views/index.html')

  // save position when close
  win.on('close', () => {
    const winBounds = win.getBounds();
    AppConfig.saveSettings('bounds', winBounds)
    app.quit()
  })
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:SelectFolder', openFolderDialog)
  ipcMain.handle('dialog:EditDescription', (event, args) => openDescriptionDialog(args))
  ipcMain.on('dialog:Notification', openNotificationWindow)
  ipcMain.on('dialog:SelectTargets', (event, args) => openSelectWindow(args))
  // ipcMain.on('dialog:CloseSelect', (event) => selectWin.close() )
  ipcMain.on('returnSelected', async (event, args) => { 
    await selectWin.close()
    // await win.webContents.focus()
    await win.focus()
    await new Promise(r => setTimeout(r, 500));

    await overwrite(args)
  })

  createWindow()
  win.focus()

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
  const locale = getLocale()

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

function openNotificationWindow() {
const locale = getLocale()

dialog.showMessageBoxSync({
    message: locale.titles.successMsg,
    type: "info",
    buttons: [locale.buttons.confirm],
    title: locale.titles.success,
    icon: path.join(__dirname, 'assets', 'check.png'),
  })
}

async function openSelectWindow(args) {
  const mainWinBounds = win.getBounds()
  const savedBounds = AppConfig.readSettings('selectWinBounds')
  const bounds = savedBounds ?? {
    width: 600,
    height: 500,
    x: mainWinBounds.x + 200,
    y: mainWinBounds.y + 200,
  }
  bounds.webPreferences = {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: true,
    contextIsolation: false,
  }
  selectWin = new BrowserWindow(bounds)
  selectWin.webContents.openDevTools()
  // save position when close
  selectWin.on('close', () => {
    const selectWinBounds = selectWin.getBounds();
    AppConfig.saveSettings('selectWinBounds', selectWinBounds)
  })

  await selectWin.loadFile('./src/views/select.html')
  selectWin.webContents.send('loadSelect', args)
}