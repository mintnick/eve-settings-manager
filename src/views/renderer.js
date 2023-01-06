window.$ = window.jQuery = require('jquery');
const { readdir } = require('node:fs/promises')
const path = require('path')
const AppConfig = require('../configuration')
const changeLanguage = require('../js/change-language')

const language = AppConfig.readSettings('language')
if (!language) {
  AppConfig.saveSettings('language', 'zh-CN')
  language = 'zh-CN'
}
const languageSelect = $('#language-select')
languageSelect.val(language)
changeLanguage(language)

languageSelect.on('change', () => {
  const language = languageSelect.val()
  AppConfig.saveSettings('language', language)
  changeLanguage(language)
})