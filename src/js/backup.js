'use strict';

const $ = require('jquery')
const { getLocale } = require('./change-language')
const { readdir, mkdir, copyFile } = require('node:fs/promises')
const { join } = require('path')
const { ipcRenderer } = require('electron')

async function backupFiles() {
  let folderPath = $('#folder-select').val()
  if (!folderPath) return

  folderPath = join(folderPath, 'settings_Default')
  const files =
  (await readdir(folderPath, { withFileTypes: true }))
  .filter(dirent => dirent.isFile())
  .filter(dirent => (
    dirent.name.startsWith('core_')
    && dirent.name.endsWith('.dat')
    && !(dirent.name.split('.')[0].endsWith('_') || dirent.name.split('.')[0].endsWith(')'))
    ))
  .map(dirent => dirent.name)

  const date = (new Date().toLocaleString('zh-CN', { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"}))
                .replace(/\s/, "")
                .replace(/:/, "")
                .replace(/\//, "")
  const backupName = 'Backup-' + date
  const backupPath = join(folderPath, backupName)
  mkdir(backupPath, { recursive: true }).then(() => {
    for (const file of files) {
      const source = join(folderPath, file)
      const destination = join(backupPath, file)
      copyFile(source, destination)
    }
    const msg = getLocale().titles.backupSuccess + backupPath
    ipcRenderer.send('dialog:Notification', msg)
  })
}

module.exports = {
  backupFiles,
}