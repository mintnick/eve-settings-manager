const $ = require('jquery')
const AppConfig = require('../configuration')
const changeLanguage = require('./change-language')
const changeServer = require('./change-server')

function init() {
  // init language
  let language = AppConfig.readSettings('language')
  if (!language) {
    AppConfig.saveSettings('language', 'zh-CN')
    language = 'zh-CN'
  }
  const languageSelect = $('#language-select')
  languageSelect.val(language)
  changeLanguage(language)

  languageSelect.on('change', () => {
    const selectedLang = languageSelect.val()
    AppConfig.saveSettings('language', selectedLang)
    changeLanguage(selectedLang)
  })

  // init server
  let server = AppConfig.readSettings('server')
  if (!server) {
    AppConfig.saveSettings('server', 'tranquility')
    server = 'tranquility'
  }
  const serverSelect = $('#server-select')
  serverSelect.val(server)
  changeServer(server)

  serverSelect.on('change', () => {
    const selectedServer = serverSelect.val()
    AppConfig.saveSettings('server', selectedServer)
    changeServer(selectedServer)
  })
}

module.exports = init
