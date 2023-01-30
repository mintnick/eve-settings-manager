'use strict';

const $ = require('jquery')
const { shell, ipcRenderer } = require('electron')
const { join } = require('path')
const { statSync } = require('fs')
const { readdir, readFile, writeFile } = require('node:fs/promises')
const AppConfig = require('../configuration')
const phin = require('phin')

const surfixes = {
  "tranquility": "eve_sharedcache_tq_tranquility",
  "serenity": "eve_sharedcache_serenity_serenity.evepc.163.com",
  "singularity": "eve_sharedcache_sg_singularity",  // TODO install singularity
  "dawn": "eve_sharedcache_dawn_dawn.evepc.163.com", // TODO install dawn server
  "thunderdome": "eve_sharedcache_td_thunderdome", // TODO install thunderdome
}
const paths = {
  "win32": join('AppData', 'Local', 'CCP', 'EVE'),
  // "darwin": join('Library', 'Application Support', 'EVE Online') // FIXME install eve on mac
  "darwin": join('Downloads') // TODO remove test
}
const prefixes = {
  "user": "core_user_",
  "char": "core_char_"
}
const urls = {
  "charName": {
    "tranquility": "https://esi.evetech.net/latest/characters/",
    "serenity": "https://esi.evepc.163.com/latest/characters/",
    "singularity": "",
    "dawn": "",
    "thunderdome": ""
  },
  "surfix": {
    "tranquility": "/?datasource=tranquility",
    "serenity": "/?datasource=serenity",
    "singularity": "",
    "dawn": "",
    "thunderdome": ""
  }
}
const settingFolderName = 'settings_Default'

// read default setting folders, render in folder select
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

  // render default dirs
  const folderSelect = $('#folder-select')
  folderSelect.find('option').remove()
  for (const dir of defaultDirs) {
    folderSelect.append($('<option>', {
      value: dir,
      text: dir
    }))
  }
  // load saved folder
  let savedFolder = AppConfig.readSettings(`savedFolder.${server}`)
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

// add manually selected folder to folder select
async function setSelectedFolder(folderPath) {
  if (!folderPath) return
  const server = $('#server-select').val()
  AppConfig.saveSettings(`savedFolder.${server}`, folderPath)
  const folderSelect = $('#folder-select')
  folderSelect.append($('<option>', {
    value: folderPath,
    text: folderPath,
    selected: true
  }))
  // wait 0.1s to read the correct folder
  await new Promise(r => setTimeout(r, 100));
  readSettingFiles()
}

// open selected folder in OS
function openFolder() {
  const folderPath = join($('#folder-select').val(), settingFolderName)
  // shell.showItemInFolder(folderPath)
  shell.openPath(folderPath)
}

// read setting files in current folder
async function readSettingFiles() {
  // get both char and user selects
  const selects = $('.select-list')
  selects.find('option').remove()

  // set loading text
  selects.append($('<option>', { val: 0, text: 'loading...' }))

  // read files
  const selectedFolder = $('#folder-select').val()
  if (!selectedFolder) return
  const folderPath = join(selectedFolder, settingFolderName)
  const server = $('#server-select').val()
  const files =
    (await readdir(folderPath, { withFileTypes: true }))
    .filter(dirent => dirent.isFile())
    .filter(dirent => ( dirent.name.startsWith('core_') && dirent.name.endsWith('.dat')))
    .map(dirent => dirent.name.split('.')[0])
  const charFiles = files.filter(file => file.startsWith(prefixes.char))
  const userFiles = files.filter(file => file.startsWith(prefixes.user))

  // construct char and user objects
  // {
  //   filename(w/o .dat): {
  //     id,
  //     mtime,
  //     name,  // char only
  //     savedDescription
  //   }
  // }
  const chars = {}
  const users = {}

  // char files
  for (const file of charFiles) {
    chars[file] = {}
    const id = file.split('_')[2]
    chars[file].id = id
    chars[file].mtime = statSync(join(folderPath, file + '.dat')).mtime.toLocaleString('zh-CN')

    // get saved name
    chars[file].name = "<unknown>"
    if (['tranquility', 'serenity'].includes(server)) {
      const savedName = AppConfig.readSettings(`names.${server}.${file}`)
      if (savedName) {  // name has been saved
        chars[file].name = savedName
      } else {  // read name from esi
        const res = await phin(urls.charName[server] + id + urls.surfix[server])
        if (res.statusCode == 200) {
          const name = JSON.parse(res.body).name
          chars[file].name = name
          AppConfig.saveSettings(`names.${server}.${file}`, name)
        }
      }
    }
    // get saved description
    const savedDescription = AppConfig.readSettings(`descriptions.${server}.${file}`)
    if (savedDescription) {
      chars[file].description = savedDescription
    }
  }
  
  // user files
  for (const file of userFiles) {
    users[file] = {}
    const id = file.split('_')[2]
    users[file].id = id
    users[file].mtime = statSync(join(folderPath, file + '.dat')).mtime.toLocaleString('zh-CN')
    const savedDescription = AppConfig.readSettings(`descriptions.${server}.${file}`)
    if (savedDescription) {
      users[file].description = savedDescription
    }
  }
  // console.log(chars, users)
  
  // render selects
  const charSelect = $('#char-select')
  charSelect.find('option').remove()
  for (const [filename, values] of Object.entries(chars)) {
    const opt_text = `${values.id} - ${values.name} - ${values.mtime}` + (values.description ? ` - [${values.description}]` : '')
    charSelect.append($('<option>', {
      value: filename,
      text: opt_text
    }))
  }

  const userSelect = $('#user-select')
  userSelect.find('option').remove()
  for (const [filename, values] of Object.entries(users)) {
    const opt_text = `${values.id} - ${values.mtime}` + (values.description ? ` - [${values.description}]` : '')
    userSelect.append($('<option>', {
      value: filename,
      text: opt_text
    }))
  }
}

// @params
// args = {
//   type: user/char,
//   folder: full path of current folder,
//   selected: selected file with .dat extension,
//   targets: the other files with .dat extension,
// }
async function overwrite(args) {
  const content = await readFile(join(args.folder, args.selected))
  const targets = args.targets
  if (!targets || targets.length == 0) return
  for (const target of targets) {
    const filePath = join(args.folder, target)
    await writeFile(filePath, content)
  }
  ipcRenderer.send('dialog:Notification')
  readSettingFiles()
}

module.exports = {
  readDefaultFolders,
  setSelectedFolder,
  openFolder,
  readSettingFiles,
  overwrite,
}