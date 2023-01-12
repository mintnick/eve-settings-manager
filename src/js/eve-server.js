//        if server == 'Tranquility':
// self.prefix = 'https://esi.evetech.net/latest/characters/'
// self.suffix = '/?datasource=tranquility'
// elif server == 'Serenity':
// self.prefix = 'https://esi.evepc.163.com/latest/characters/'
// self.suffix = '/?datasource=serenity'

const phin = require('phin')
const $ = require('jquery')
const AppConfig = require('../configuration')
const { getLocale } = require('./change-language')
const { readDefaultFolders, readSettingFiles } = require('./eve-folder.js')

// TODO get other urls
const urls = {
  "status": {
    "tranquility": "https://esi.evetech.net/latest/status/",
    "serenity": "https://esi.evepc.163.com/latest/status/?datasource=serenity",
    "singularity": "",
    "dawn": "",
    "thunderdome": ""
  },
}

async function changeServer(server) {
  AppConfig.saveSettings('server', server)
  const locale = getLocale()
  const title = locale.servers[server]

  const serverTitle = $('#server-title')
  serverTitle.text(title)

  await getServerStatus()
  await readDefaultFolders()
  await readSettingFiles()
}

async function getServerStatus() {
  const server = $('#server-select').val()
  const locale = getLocale()
  const serverStatus = $('#server-status')
  const playerCount = $('#player-count')
  let status, players, cssClass;

  const res = await phin({
    'url': urls.status[server],
    'parse': 'json'
  })
  if (res.statusCode == 504) {
    status = locale.serverStatus.offline
    cssClass = 'text-danger fw-bold'
    players = 'N/A'
  } else if (res.statusCode == 200) {
    status = locale.serverStatus.online
    players = res.body.players
    cssClass = 'text-success fw-bold'
  }

  serverStatus.text(status)
  serverStatus.attr('class', cssClass)
  playerCount.text(players)
  playerCount.attr('class', cssClass)
}

module.exports = {
  urls,
  changeServer,
  getServerStatus,
}