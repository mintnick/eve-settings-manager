const $ = require('jquery')
const { shell } = require('electron')
const { join } = require('path')
const { readdir } = require('node:fs/promises')

const surfixes = {
  "tranquility": "eve_sharedcache_tq_tranquility",
  "serenity": "eve_sharedcache_serenity_serenity.evepc.163.com"
}
const paths = {
  "win32": join('AppData', 'Local', 'CCP', 'EVE'),
  // "darwin": join('Library', 'Application Support', 'EVE Online')
  "darwin": join('Downloads') // TODO remove test
}
const prefixes = {
  "user": "core_user_",
  "char": "core_char_"
}
const folderName = 'settings_Default'
// const prefixUser = 'core_user_'
// const prefixChar = 'core_char_'

async function readDefaultFolders() {
  const server = $('#server-select').val() ?? 'tranquility'
  const os = process.platform
  const homePath = process.env[(os == 'win32') ? 'USERPROFILE' : 'HOME']
  const fullPath = join(homePath, paths[os])

  const defaultDirs = 
    (await readdir(fullPath, { withFileTypes: true} ))
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => dirent.name.endsWith(surfixes[server]))
    .map(dirent => join(fullPath, dirent.name))
  // console.log(defaultDirs)

  const folderSelect = $('#folder-select')
  // TODO check selected folder
  folderSelect.find('option').remove()
  for (const dir of defaultDirs) {
    console.log(dir)
    folderSelect.append($('<option>', {
      value: dir,
      text: dir
    }))
  }
}

function openFolder() {
  const path = $('#folder-select').val()
  shell.showItemInFolder(path)
}

module.exports = {
  readDefaultFolders,
  openFolder,
}