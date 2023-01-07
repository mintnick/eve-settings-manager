const { ipcRenderer } = require('electron')
const $ = require('jquery')
const AppConfig = require('../configuration')
const changeLanguage = require('./change-language')
const { changeServer, getServerStatus } = require('./eve-server')
const { openFolder, readDefaultFolders, setSelectedFolder } = require('./eve-folder')

const languageSelect = $('#language-select')
const serverSelect = $('#server-select')
const folderSelect = $('#folder-select')
const selectFolderButton = $('#select-folder-btn')
const openFolderButton = $('#open-folder-btn')

function init() {
  initSelects()
  bindEvents()
}

function initSelects() {
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
    // TODO refresh tables
  })

  selectFolderButton.on('click', async (e) => {
    e.preventDefault()
    const folderPath = await window.electronAPI.openFolderDialog()
    setSelectedFolder(folderPath)
  })

  openFolderButton.on('click', (e) => {
    e.preventDefault()
    openFolder()
  })
}

module.exports = {
  init,
}
