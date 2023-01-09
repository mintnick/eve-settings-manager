const { ipcRenderer } = require('electron')

window.electronAPI = {
  openFolderDialog: () => ipcRenderer.invoke('dialog:SelectFolder'),
  openDescriptionDialog: (args) => ipcRenderer.invoke('dialog:EditDescription', args),
  openNotificationDialog: () => ipcRenderer.send('dialog:Notification'),
  openSelectWindow: (args) => ipcRenderer.send('dialog:SelectTargets', args),
  // onLoadSelect: (args) => ipcRenderer.on('loadSelect', args)
  // closeSelectWindow: () => ipcRenderer.send('dialog:CloseSelect'),
  returnSelected: (args) => ipcRenderer.send('returnSelected', args)
}