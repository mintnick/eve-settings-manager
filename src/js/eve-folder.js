const $ = require('jquery')
const { shell } = require('electron')
const { join, extname } = require('path')
const { readdir } = require('node:fs/promises')
const AppConfig = require('../configuration')

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

  if (defaultDirs.length == 0) return

  // write default dirs
  const folderSelect = $('#folder-select')
  folderSelect.find('option').remove()
  for (const dir of defaultDirs) {
    folderSelect.append($('<option>', {
      value: dir,
      text: dir
    }))
  }
  // load saved folder
  let savedFolder = AppConfig.readSettings('savedFolder.' + server)
  if (!savedFolder) {
    savedFolder = defaultDirs[0]
  } else if (!defaultDirs.includes(savedFolder)) {
    folderSelect.append($('<option>', {
      value: savedFolder,
      text: savedFolder,
    }))
  }
  folderSelect.find('option[value="' + savedFolder + '"]').prop("selected", true)
}

function setSelectedFolder(folderPath) {
  if (!folderPath || folderPath.length == 0) return
  const server = $('#server-select').val()
  AppConfig.saveSettings('savedFolder.' + server, folderPath)
  const folderSelect = $('#folder-select')
  folderSelect.append($('<option>', {
    value: folderPath,
    text: folderPath,
    selected: true
  }))
}

// FIXME not inside the folder on Mac
function openFolder() {
  const p = join($('#folder-select').val(), folderName)
  shell.showItemInFolder(p)
}

// TODO read files in folder
async function readSettingFiles() {
  const p = join($('#folder-select').val(), folderName)
  const files =
    (await readdir(p, { withFileTypes: true }))
    .filter(dirent => dirent.isFile())
    .filter(dirent => ( dirent.name.startsWith('core_') && dirent.name.endsWith('.dat')))
    .map(dirent => dirent.name)
  const chars = files.filter(file => file.startsWith(prefixes.char))
  const users = files.filter(file => file.startsWith(prefixes.user))
  console.log(chars, users)

  const charSelect = $('#char-select')
  charSelect.find('option').remove()
  for (const char of chars) {
    charSelect.append($('<option>', {
      value: char,
      text: char.split('.')[0].split('_')[2]
    }))
  }

  const userSelect = $('#user-select')
  userSelect.find('option').remove()
  for (const user of users) {
    userSelect.append($('<option>', {
      value: user,
      text: user.split('.')[0].split('_')[2]
    }))
  }
}

module.exports = {
  readDefaultFolders,
  setSelectedFolder,
  openFolder,
  readSettingFiles,
}