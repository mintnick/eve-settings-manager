const { ipcRenderer } = require('electron')
const $ = require('jquery')
const AppConfig = require('../configuration')
const { changeLanguage } = require('./change-language')
const { changeServer, getServerStatus } = require('./eve-server')
const { openFolder, readDefaultFolders, setSelectedFolder, readSettingFiles, overwrite } = require('./eve-folder')
const { editDescription } = require('./edit-description')
const { join } = require('path')

const languageSelect = $('#language-select')
const serverSelect = $('#server-select')
const folderSelect = $('#folder-select')
const selectFolderBtn = $('#select-folder-btn')
const openFolderBtn = $('#open-folder-btn')
const clearCacheBtn = $('#clear-cache-btn')
const editDescriptionBtn = $('.edit-description-btn')
const overwriteBtn = $('.overwrite-btn')

function init() {
  initSelects()
  bindEvents()
}

async function initSelects() {
  let language = AppConfig.readSettings('language')
  if (!language) {
    AppConfig.saveSettings('language', 'zh-CN')
    language = 'zh-CN'
  }
  languageSelect.val(language)
  changeLanguage(language)

  let server = AppConfig.readSettings('server')
  if (!server) {
    AppConfig.saveSettings('server', 'tranquility')
    server = 'tranquility'
  }
  serverSelect.val(server)
  changeServer(server)

  readDefaultFolders()

  await new Promise(r => setTimeout(r, 500));

  readSettingFiles()
}

function bindEvents() {
  languageSelect.on('change', () => {
    const selectedLang = languageSelect.val()
    AppConfig.saveSettings('language', selectedLang)
    changeLanguage(selectedLang)
  })

  serverSelect.on('change', () => {
    const selectedServer = serverSelect.val()
    AppConfig.saveSettings('server', selectedServer)
    changeServer(selectedServer)
    readDefaultFolders()
    getServerStatus()
  })

  folderSelect.on('change', () => {
    const selectedFolder = folderSelect.val()
    const server = serverSelect.val()
    AppConfig.saveSettings('savedFolder.' + server, selectedFolder)
    readSettingFiles()
  })

  selectFolderBtn.on('click', async (e) => {
    e.preventDefault()
    const folderPath = await window.electronAPI.openFolderDialog()
    setSelectedFolder(folderPath)
  })

  openFolderBtn.on('click', (e) => {
    e.preventDefault()
    openFolder()
  })

  clearCacheBtn.on('click', (e) => {
    e.preventDefault()
    AppConfig.clear()
  })

  editDescriptionBtn.on('click', async (e) => {
    e.preventDefault()
    const args = {}

    const id = e.target.id
    const type = (id == "edit-char-description-btn") ? 'char' : 'user'
    args.type = type
    const file = $(`#${type}-select`).val()
    if (!file) return
    args.file = file
    
    const server = $('#server-select').val()
    args.server = server

    const savedDescription = AppConfig.readSettings(`descriptions.${server}.${file}`)
    if (savedDescription) args.savedDescription = savedDescription

    const description = await window.electronAPI.openDescriptionDialog(args)
    if (!description || description == '' || description == savedDescription) return
    args.savedDescription = description
    editDescription(args)
  })

  overwriteBtn.on('click', async (e) => {
    e.preventDefault()
    const args = {}

    const btnId = e.target.id
    if (btnId.includes('char')) args.type = 'char'
    else args.type = 'user'
    const select = $(`#${args.type}-select`).val()
    if (!select) return
    const folder = $('#folder-select').val()
    args.folder = join(folder, 'settings_Default')
    args.selected = select

    let targets = $(`#${args.type}-select option`).not(':selected').toArray()
    if (btnId.includes('selected')) {
      targets = targets.map(t => t.innerText)
      args.targets = targets
      window.electronAPI.openSelectWindow(args)
    } else {
      targets = targets.map(t => t.value + '.dat')
      args.targets = targets
      await overwrite(args)
    }
  })
}

module.exports = {
  init,
}
