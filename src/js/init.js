const $ = require('jquery')
const AppConfig = require('../configuration')
const changeLanguage = require('./change-language')
const changeServer = require('./change-server')
const { openFolder, readDefaultFolders } = require('./eve-folder')

const languageSelect = $('#language-select')
const serverSelect = $('#server-select')
const folderSelect = $('#folder-select')
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
  })

  folderSelect.on('change', () => {
    const selectedFolder = folderSelect.val()
    const server = serverSelect.val()
    AppConfig.saveSettings('savedFolder:' + server, selectedFolder)
    // TODO refresh tables
  })

  openFolderButton.on('click', (e) => {
    e.preventDefault()
    openFolder()
  })
}

module.exports = init
