const { ipcRenderer } = require('electron')

// contextBridge.exposeInMainWorld('electronAPI',{
//   openFolderDialog: () => ipcRenderer.invoke('openDialog')
// })

window.electronAPI = {
  openFolderDialog: () => ipcRenderer.invoke('dialog:SelectFolder'),
}