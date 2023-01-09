'use strict'
const $ = require('jquery')
const AppConfig = require('../configuration')

function changeLanguage(lang) {
  AppConfig.saveSettings('language', lang);
  const locale = getLocale()

  const serverSelect = $('#server-select');
  const serverTitle = $('#server-title')
  const selectFolderBtn = $('#select-folder-btn')
  const openFolderBtn = $('#open-folder-btn')
  const editCharDescriptionBtn = $('#edit-char-description-btn')
  const overwriteCharBtn = $('#overwrite-char-btn')
  const overwriteSelectedCharBtn = $('#overwrite-selected-char-btn')
  const editAccountDescriptionBtn = $('#edit-account-description-btn')
  const overwriteAccountBtn = $('#overwrite-account-btn')
  const overwriteSelectedAccountBtn = $('#overwrite-selected-account-btn')
  const loginBtn = $('#login-btn')
  const charTableTitle = $('#char-table-title')
  const accountTableTitle = $('#account-table-title')
  const serverStatusTitle = $('#server-status-title')
  const playerCountTitle = $('#player-count-title')

  // server select
  const servers = locale.servers;
  const server = AppConfig.readSettings('server') ?? 'tranquility'
  serverSelect.find('option').remove();
  for (const [key, value] of Object.entries(servers)) {
    serverSelect.append($('<option>', {
      value: key,
      text: value,
    }))
  }
  serverSelect.find('option[value="' + server + '"]').prop("selected", true)
  serverTitle.text(serverSelect.find(":selected").text())
  
  // titles
  const titles = locale.titles
  charTableTitle.text(titles.character)
  accountTableTitle.text(titles.account)
  serverStatusTitle.text(titles.serverStatus)
  playerCountTitle.text(titles.players)

  // buttons
  const buttons = locale.buttons;
  selectFolderBtn.text(buttons.selectFolder)
  openFolderBtn.text(buttons.openFolder)
  overwriteCharBtn.text(buttons.overwriteChar)
  overwriteSelectedCharBtn.text(buttons.overwriteSelectedChar)
  overwriteAccountBtn.text(buttons.overwriteAccount)
  overwriteSelectedAccountBtn.text(buttons.overwriteSelectedAccount)
  loginBtn.text(buttons.login)
  editCharDescriptionBtn.text(buttons.editDescription)
  editAccountDescriptionBtn.text(buttons.editDescription)
}

function getLocale() {
  const language = AppConfig.readSettings('language')
  const locale = require(`../locales/${language}.json`)
  return locale
}

module.exports = {
  changeLanguage,
  getLocale
}