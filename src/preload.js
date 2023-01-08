const { ipcRenderer } = require('electron')

window.electronAPI = {
  openFolderDialog: () => ipcRenderer.invoke('dialog:SelectFolder'),
  openDescriptionDialog: (arg1, arg2) => ipcRenderer.send('dialog:EditDescription', [arg1, arg2]),
}