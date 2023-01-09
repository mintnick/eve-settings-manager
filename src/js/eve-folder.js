const $ = require('jquery')
const { shell } = require('electron')
const { join } = require('path')
const { statSync } = require('fs')
const { readdir, readFile, writeFile } = require('node:fs/promises')
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

async function readSettingFiles() {
  // set loading text
  const selects = $('.select-list')
  selects.find('option').remove()
  selects.append($('<option>', { text: 'loading...' }))

  // read files
  const p = join($('#folder-select').val(), folderName)
  const server = $('#server-select').val()
  if (!p) return
  const files =
    (await readdir(p, { withFileTypes: true }))
    .filter(dirent => dirent.isFile())
    .filter(dirent => ( dirent.name.startsWith('core_') && dirent.name.endsWith('.dat')))
    .map(dirent => dirent.name.split('.')[0])
  const charFiles = files.filter(file => file.startsWith(prefixes.char))
  const userFiles = files.filter(file => file.startsWith(prefixes.user))

  // construct char and user objects
  const chars = {}
  const users = {}

  for (const file of charFiles) {
    chars[file] = {}
    const id = file.split('_')[2]
    chars[file].id = id

    chars[file].mtime = statSync(join(p, file + '.dat')).mtime.toLocaleString('zh-CN')

    const savedName = AppConfig.readSettings(`names.${server}.${file}`)
    if (savedName) {
      chars[file].name = savedName
    } else {
      const res = await phin(urls.charName[server] + id + urls.surfix[server])
      if (res.statusCode == 200) {
        const name = JSON.parse(res.body).name
        chars[file].name = name
        AppConfig.saveSettings(`names.${server}.${file}`, name)
      }
      else chars[file].name = '<unknown>'
    }

    const savedDescription = AppConfig.readSettings(`descriptions.${server}.${file}`)
    if (savedDescription) {
      chars[file].description = savedDescription
      // console.log(savedDescription)
    }
  }

  for (const file of userFiles) {
    users[file] = {}
    const id = file.split('_')[2]
    users[file].id = id

    users[file].mtime = statSync(join(p, file + '.dat')).mtime.toLocaleString('zh-CN')
    const savedDescription = AppConfig.readSettings(`descriptions.${server}.${file}`)
    if (savedDescription) {
      users[file].description = savedDescription
      // console.log(savedDescription)
    }
  }

  // console.log(chars, users)
  
  // render selects
  const charSelect = $('#char-select')
  charSelect.find('option').remove()
  for (const [filename, values] of Object.entries(chars)) {
    // console.log(values)
    const opt_text = values.id + ' - ' + values.name + ' - ' + values.mtime + (values.description ? ` - [${values.description}]` : '')
    charSelect.append($('<option>', {
      value: filename,
      text: opt_text
    }))
  }

  const userSelect = $('#user-select')
  userSelect.find('option').remove()
  for (const [filename, values] of Object.entries(users)) {
    // console.log(values)
    const opt_text = values.id + ' - ' + values.mtime + (values.description ? ` - [${values.description}]` : '')
    userSelect.append($('<option>', {
      value: filename,
      text: opt_text
    }))
  }
}

// TODO
async function overwrite(args) {
  // console.log(args)
  const content = await readFile(join(args.folder, args.selected + '.dat'))
  const targets = args.targets
  if (!targets || targets.length == 0) return
  for (const target of targets) {
    const filePath = join(args.folder, target)
    await writeFile(filePath, content)
  }
  window.electronAPI.openNotificationDialog()
  readSettingFiles()
}

module.exports = {
  readDefaultFolders,
  setSelectedFolder,
  openFolder,
  readSettingFiles,
  overwrite,
}