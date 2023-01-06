'use strict'
const $ = require('jquery')
const AppConfig = require('../configuration')

function changeServer(server) {
  AppConfig.saveSettings('server', server)
  const lang = AppConfig.readSettings('language') ?? 'zh-CN'
  const locale = require('../locales/' + lang + '.json')
  const title = locale.servers[server]

  const serverTitle = $('#server-title')
  serverTitle.text(title)
}

module.exports = changeServer