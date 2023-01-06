'use strict'
const $ = require('jquery')
const AppConfig = require('../configuration')

function changeLanguage(lang) {
  AppConfig.saveSettings('language', lang);
  const locale = require('../locales/'+lang+'.json')

  const serverSelect = $('#server-select');
  const serverTitle = $('#server-title')
  const selectFolderBtn = $('#select-folder-btn')
  const openFolderBtn = $('#open-folder-btn')
  const overwriteCharBtn = $('#overwrite-char-btn')
  const overwriteAccountBtn = $('#overwrite-account-btn')
  const charTableTitle = $('#char-table-title')
  const accountTableTitle = $('#account-table-title')

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

  // buttons
  const buttons = locale.buttons;
  selectFolderBtn.text(buttons.selectFolder)
  openFolderBtn.text(buttons.openFolder)
  overwriteCharBtn.text(buttons.overwriteChar)
  overwriteAccountBtn.text(buttons.overwriteAccount)
}

module.exports = changeLanguage