import electron from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import ElectronStore from 'electron-store'
import { registerIpcHandlers } from './ipc/index.js'

const { app, BrowserWindow, shell, ipcMain } = electron
const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

interface WindowBounds { x: number; y: number; width: number; height: number }
const defaultWidth  = process.platform === 'win32' ? 1280 : 1050
const defaultHeight = process.platform === 'win32' ?  780 :  660
const windowStore = new ElectronStore<{ bounds: WindowBounds }>({
  name: 'window-state',
  defaults: { bounds: { x: 0, y: 0, width: defaultWidth, height: defaultHeight } },
})

async function createWindow() {
  const bounds = windowStore.get('bounds')

  win = new BrowserWindow({
    ...bounds,
    minWidth: 900,
    minHeight: 580,
    title: 'EVE Settings Manager',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: { preload },
  })

  // Remove the default menu bar on Windows/Linux — the app has its own UI.
  // macOS menu bar is system-level (top of screen) and should be left intact.
  if (process.platform !== 'darwin') win.removeMenu()

  win.on('close', () => {
    if (!win) return
    // Persist bounds only when not maximized/minimized so we restore a sensible size
    if (!win.isMaximized() && !win.isMinimized()) {
      windowStore.set('bounds', win.getBounds())
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(indexHtml)
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

