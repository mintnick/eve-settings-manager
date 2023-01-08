const $ = require('jquery')
const { shell } = require('electron')
const { join } = require('path')
const { stat } = require('fs')
const { readdir } = require('node:fs/promises')
const AppConfig = require('../configuration')
const phin = require('phin')

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
const urls = {
  "charName": {
    "tranquility": "https://esi.evetech.net/latest/characters/",
    "serenity": "https://esi.evepc.163.com/latest/characters/"
  },
  "surfix": {
    "tranquility": "/?datasource=tranquility",
    "serenity": "/?datasource=serenity"
  }
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

async function setSelectedFolder(folderPath) {
  if (!folderPath || folderPath.length == 0) return
  const server = $('#server-select').val()
  AppConfig.saveSettings('savedFolder.' + server, folderPath)
  const folderSelect = $('#folder-select')
  folderSelect.append($('<option>', {
    value: folderPath,
    text: folderPath,
    selected: true
  }))
  
  await new Promise(r => setTimeout(r, 500));

  readSettingFiles()
}

// FIXME not inside the folder on Mac
function openFolder() {
  const p = join($('#folder-select').val(), folderName)
  shell.showItemInFolder(p)
}

// TODO read files in folder
async function readSettingFiles() {
  // set loading text
  const loadingOpts = $('.loading-opt')
  loadingOpts.text('loading...')

  // read files
  const p = join($('#folder-select').val(), folderName)
  const server = $('#server-select').val()
  if (!p) return
  const files =
    (await readdir(p, { withFileTypes: true }))
    .filter(dirent => dirent.isFile())
    .filter(dirent => ( dirent.name.startsWith('core_') && dirent.name.endsWith('.dat')))
    .map(dirent => dirent.name)
  const charFiles = files.filter(file => file.startsWith(prefixes.char))
  const userFiles = files.filter(file => file.startsWith(prefixes.user))

  // construct char and user objects
  const chars = {}
  const users = {}

  for (const file of charFiles) {
    chars[file] = {}
    const id = file.split('.')[0].split('_')[2]
    chars[file].id = id

    stat(join(p, file), (err, stats) => {
      if (err) return
      chars[file].mtime = stats.mtime.toLocaleString('zh-CN')
    })

    // TODO check local storage
    const res = await phin(urls.charName[server] + id + urls.surfix[server])
    if (res.statusCode == 200) chars[file].name = JSON.parse(res.body).name
    else chars[file].name = '<unknown>'
  }

  for (const file of userFiles) {
    users[file] = {}
    const id = file.split('.')[0].split('_')[2]
    users[file].id = id

    stat(join(p, file), (err, stats) => {
      if (err) return
      users[file].mtime = stats.mtime.toLocaleString('zh-CN')
    })
  }

  console.log(chars, users)
  
  // render selects
  const charSelect = $('#char-select')
  charSelect.find('option').remove()
  for (const [filename, values] of Object.entries(chars)) {
    console.log(values)
    charSelect.append($('<option>', {
      value: filename,
      text: values.id + ' - ' + values.name + ' - ' + values.mtime
    }))
  }

  const userSelect = $('#user-select')
  userSelect.find('option').remove()
  for (const [filename, values] of Object.entries(users)) {
    console.log(values)
    userSelect.append($('<option>', {
      value: filename,
      text: values.id + ' - ' + values.mtime  // FIXME mtime missing
    }))
  }
}

function overwrite(type, prototype, target = []) {
  // TODO overwrite
}

module.exports = {
  readDefaultFolders,
  setSelectedFolder,
  openFolder,
  readSettingFiles,
  overwrite,
}