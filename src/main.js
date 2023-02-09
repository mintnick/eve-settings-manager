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
  const bounds = savedBounds
  const options = {
    ...bounds,
    width: 1080,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  }
  win = new BrowserWindow(options)

  if(app.isPackaged) {
    win.setResizable(false);
  } else {
    win.webContents.openDevTools()
  }
  
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
  ipcMain.on('dialog:Notification', (event, msg) => openNotificationWindow(msg))
  ipcMain.on('dialog:SelectTargets', (event, args) => openSelectWindow(args))
  ipcMain.on('returnSelected', async (event, args) => { 
    await selectWin.close()
    reload()
    await overwrite(args)
  })
  ipcMain.on('cancelSelected', () => { selectWin.close() })
  ipcMain.on('reload', () => reload() )

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

function reload() {
  win.reload()
}

async function openFolderDialog() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (canceled) return 
  else return filePaths[0]
}

async function openDescriptionDialog(args) {
  const locale = getLocale()

  const description = await prompt({
    title: locale.titles.editDesc,
    label: locale.titles.editLabel,
    value: args.savedDescription ?? '',
    inputAttrs: {
      type: 'text',
      maxlength: 20,
    },
    type: 'input',
    resizable: false,
    alwaysOnTop: true,
    buttonLabels: {
      "ok": locale.buttons.confirm,
      "cancel": locale.buttons.cancel
    }
  }, win)

  return description
}

function openNotificationWindow(msg) {
  const locale = getLocale()

  dialog.showMessageBoxSync(
    win,
    {
      message: msg,
      type: "info",
      buttons: [locale.buttons.confirm],
      title: locale.titles.success,
      icon: path.join(__dirname, 'assets', 'check.png'),
    }
  )
}

async function openSelectWindow(args) {
  const bounds = {
    width: 700,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    parent: win,
    modal: true
  }
  selectWin = new BrowserWindow(bounds)
  selectWin.setResizable(false);

  await selectWin.loadFile('./src/views/select.html')
  selectWin.webContents.send('loadSelect', args)  // passing the other options to sub window
}