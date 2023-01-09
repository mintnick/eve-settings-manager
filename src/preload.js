const { ipcRenderer } = require('electron')

window.electronAPI = {
  openFolderDialog: () => ipcRenderer.invoke('dialog:SelectFolder'),
  openDescriptionDialog: (args) => ipcRenderer.invoke('dialog:EditDescription', args),
  openNotificationDialog: () => ipcRenderer.send('dialog:Notification'),
}