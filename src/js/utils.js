'use strict';

const { ipcRenderer } = require('electron')
const $ = require('jquery')
const AppConfig = require('../configuration')
const { changeLanguage } = require('./change-language')
const { changeServer } = require('./eve-server')
const { openFolder, setSelectedFolder, readSettingFiles, overwrite, readDefaultFolders } = require('./eve-folder')
const { editDescription } = require('./edit-description')
const { backupFiles } = require('./backup')
const { join } = require('path')
const { readdir } = require('node:fs/promises')

const localePath = join(__dirname, '../locales')

const languageSelect = $('#language-select')
const serverSelect = $('#server-select')
const folderSelect = $('#folder-select')
const selectFolderBtn = $('#select-folder-btn')
const openFolderBtn = $('#open-folder-btn')
const backupBtn = $('#backup-btn')
const clearCacheBtn = $('#clear-cache-btn')
const editDescriptionBtn = $('.edit-description-btn')
const overwriteBtn = $('.overwrite-btn')

function init() {
  initSelects()
  bindEvents()
}

async function initSelects() {
  // load locale files
  const locales = (await readdir(localePath, { withFileTypes: true }))
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
    .map(dirent => join(localePath, dirent.name))
  languageSelect.find('option').remove()
  for (const locale of locales) {
    const localeFile = require(locale)
    const langValue = locale.replace(/^.*[\\\/]/, '').split('.')[0]
    languageSelect.append($('<option>', {
      value: langValue,
      text: localeFile.language
    }))
  }

  // set language
  let language = AppConfig.readSettings('language')
  if (!language) {
    let locale_lang = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale_lang.includes('zh')) language = 'zh-CN'
    else language = 'en'
  }
  languageSelect.val(language)
  changeLanguage(language)

  // set server
  let server = AppConfig.readSettings('server')
  if (!server) {
    AppConfig.saveSettings('server', 'tranquility')
    server = 'tranquility'
  }
  // serverSelect.val(server)
  await changeServer(server)

  // set file select size
  const selects = $('#table-section select')
  const os = process.platform
  if (os == 'darwin') selects.attr('size', 20)
}

function bindEvents() {
  languageSelect.on('change', () => {
    changeLanguage(languageSelect.val())
  })

  serverSelect.on('change', () => {
    changeServer(serverSelect.val())
  })

  folderSelect.on('change', () => {
    AppConfig.saveSettings(`savedFolder.${serverSelect.val()}`, folderSelect.val())
    readSettingFiles()
  })

  selectFolderBtn.on('click', async (e) => {
    e.preventDefault()
    const folderPath = await ipcRenderer.invoke('dialog:SelectFolder')
    setSelectedFolder(folderPath)
  })

  openFolderBtn.on('click', (e) => {
    e.preventDefault()
    openFolder()
  })

  backupBtn.on('click', (e) => {
    e.preventDefault()
    backupFiles()
  })

  clearCacheBtn.on('click', (e) => {
    e.preventDefault()
    AppConfig.clear()
    ipcRenderer.send('reload')
  })

  editDescriptionBtn.on('click', async (e) => {
    e.preventDefault()
    const args = {}

    const id = e.target.id
    const type = id.includes('char') ? 'char' : 'user'
    args.type = type
    const file = $(`#${type}-select`).val()
    if (!file) return
    args.file = file
    
    const server = $('#server-select').val()
    args.server = server

    const savedDescription = AppConfig.readSettings(`descriptions.${server}.${file}`)
    if (savedDescription) args.savedDescription = savedDescription

    const description = await ipcRenderer.invoke('dialog:EditDescription', args)
    if (description === null || description == savedDescription) return
    args.savedDescription = description
    editDescription(args)
  })

  overwriteBtn.on('click', async (e) => {
    e.preventDefault()
    const args = {}

    const btnId = e.target.id
    args.type = btnId.includes('char') ? 'char' : 'user'
    const select = $(`#${args.type}-select`).val()
    if (!select) return
    const folder = $('#folder-select').val()
    args.folder = join(folder, 'settings_Default')
    args.selected = select + '.dat'

    let targets = $(`#${args.type}-select option`).not(':selected').toArray()
    if (btnId.includes('selected')) { //overwrite selected
      targets = targets.map(t => t.innerText)
      args.targets = targets
      ipcRenderer.send('dialog:SelectTargets', args)
    } else {  // overwrite all
      targets = targets.map(t => t.value + '.dat')
      args.targets = targets
      await overwrite(args)
    }
  })
}

module.exports = {
  init,
}
