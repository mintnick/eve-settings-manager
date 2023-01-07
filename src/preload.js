const { ipcRenderer } = require('electron')

window.electronAPI = {
  openFolderDialog: () => ipcRenderer.invoke('dialog:SelectFolder'),
}