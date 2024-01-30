'use strict';

const $ = require('jquery')
const { shell, ipcRenderer } = require('electron')
const { join } = require('path')
const { statSync, existsSync } = require('fs')
const { readdir, readFile, writeFile } = require('node:fs/promises')
const { appendSelectOption, setSelectLoading, setSelectOptions } = require('./select-options')
const { getLocale } = require('./change-language')
const AppConfig = require('../configuration')
const phin = require('phin')

// const surfixes = {
//   "tranquility": "eve_sharedcache_tq_tranquility",
//   "serenity": "eve_sharedcache_serenity_serenity.evepc.163.com",
//   "singularity": "eve_sharedcache_sg_singularity",
//   "dawn": "eve_sharedcache_dawn_dawn.evepc.163.com",
//   "thunderdome": "eve_sharedcache_td_thunderdome",
// }
const paths = {
  "win32": join('AppData', 'Local', 'CCP', 'EVE'),
  "darwin": join('Library', 'Application Support', 'CCP', 'EVE')
  // "darwin": join('Downloads')
}
const prefixes = {
  "user": "core_user_",
  "char": "core_char_"
}
const urls = {
  "charName": {
    "tranquility": "https://esi.evetech.net/latest/characters/",
    "serenity": "https://ali-esi.evepc.163.com/latest/characters/",
    "singularity": "",
    "dawn": "https://ali-esi.evepc.163.com/latest/characters/",
    "thunderdome": ""
  },
  "surfix": {
    "tranquility": "/?datasource=tranquility",
    "serenity": "/?datasource=serenity",
    "singularity": "",
    "dawn": "/?datasource=infinity",
    "thunderdome": ""
  }
}
const defaultSettingFolderName = 'settings_Default'

/**
 * Finds all profiles from the current server’s settings directory and
 * populates the profile selection table.
 *
 * @returns {Promise<void>}
 */
async function findProfiles() {
  await readDefaultFolders()

  // clear table
  const profileSelect = $('#profile-select')
  setSelectLoading(profileSelect)

  const selectedFolder = $('#folder-select').val()
  if (!selectedFolder) {
    setSelectOptions(profileSelect, [])
    return;
  }

  const profileDirectories = (await readdir(selectedFolder, {withFileTypes: true}))
      .filter(entry => entry.isDirectory())
      .filter(entry => entry.name.startsWith('settings_'))
      .map(entry => entry.name)

  // add profiles to profile table
  const profileDirectoryToOption = profileDirectory => ({ value: profileDirectory, text: profileDirectory.replace(/^settings_/, '').replaceAll(/_/g, ' ') })
  setSelectOptions(profileSelect, profileDirectories.map(profileDirectoryToOption))
}

// read default setting folders, render in folder select
async function readDefaultFolders() {
  const folderSelect = $('#folder-select')
  setSelectOptions(folderSelect, [])

  const server = $('#server-select').val() ?? 'tranquility'
  const os = process.platform
  const homePath = process.env[(os == 'win32') ? 'USERPROFILE' : 'HOME']
  const fullPath = join(homePath, paths[os])

  const defaultDirs = 
    (await readdir(fullPath, { withFileTypes: true} ))
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => dirent.name.includes(server))
    .map(dirent => join(fullPath, dirent.name))
  if (defaultDirs.length == 0) return
  
  // render default dirs
  setSelectOptions(folderSelect, defaultDirs.map(dir => ({ value: dir, text: dir })))
  // load saved folder
  let savedFolder = AppConfig.readSettings(`savedFolder.${server}`)
  if (!savedFolder) {
    savedFolder = defaultDirs[0]
  } else if (!defaultDirs.includes(savedFolder)) {
    appendSelectOption(folderSelect, savedFolder, savedFolder)
  }
  folderSelect.find('option[value="' + savedFolder + '"]').prop("selected", true)
}

// add manually selected folder to folder select
async function setSelectedFolder(folderPath) {
  if (!folderPath) return
  const server = $('#server-select').val()
  AppConfig.saveSettings(`savedFolder.${server}`, folderPath)
  const folderSelect = $('#folder-select')
  appendSelectOption(folderSelect, folderPath, folderPath, true)
  // wait 0.1s to read the correct folder
  await new Promise(r => setTimeout(r, 100));
  readSettingFiles()
}

function getSelectedProfile() {
  return $('#profile-select').val() ?? defaultSettingFolderName
}

// open selected folder in OS
function openFolder() {
  const folderPath = join($('#folder-select').val(), getSelectedProfile())
  // shell.showItemInFolder(folderPath)
  shell.openPath(folderPath)
}

// read setting files in current folder
async function readSettingFiles() {
  // get both char and user selects
  const selects = $('.select-list')

  // set loading text
  setSelectLoading(selects)

  // read files
  const selectedFolder = $('#folder-select').val()
  if (!selectedFolder) {
    setSelectOptions(selects, [])
    return
  }

  const settingFolderName = getSelectedProfile()
  const folderPath = join(selectedFolder, settingFolderName)
  if (!existsSync(folderPath)) {
    setSelectOptions(selects, [])
    return
  }

  const server = $('#server-select').val()
  const files =
    (await readdir(folderPath, { withFileTypes: true }))
    .filter(dirent => dirent.isFile())
    .filter(dirent => (
      dirent.name.startsWith('core_')
      && dirent.name.endsWith('.dat')
      && !(dirent.name.split('.')[0].endsWith('_') || dirent.name.split('.')[0].endsWith(')'))
      ))
    .map(dirent => dirent.name.split('.')[0])

  if (files.length == 0) {
    setSelectOptions(selects, [])
    return
  }

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
  const characterToOption = ([filename, values]) => ({
    value: filename,
    text: `${values.id} - ${values.name} - ${values.mtime}` + (values.description ? ` - [${values.description}]` : '')
  })
  setSelectOptions(charSelect, Object.entries(chars).map(characterToOption))

  const userSelect = $('#user-select')
  const userToOption = ([filename, values]) => ({
    value: filename,
    text: `${values.id} - ${values.mtime}` + (values.description ? ` - [${values.description}]` : '')
  })
  setSelectOptions(userSelect, Object.entries(users).map(userToOption))
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
  const msg = getLocale().titles.successMsg
  ipcRenderer.send('dialog:Notification', msg)
  readSettingFiles()
}

module.exports = {
  findProfiles,
  getSelectedProfile,
  readDefaultFolders,
  setSelectedFolder,
  openFolder,
  readSettingFiles,
  overwrite,
}