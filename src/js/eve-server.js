//        if server == 'Tranquility':
// self.prefix = 'https://esi.evetech.net/latest/characters/'
// self.suffix = '/?datasource=tranquility'
// elif server == 'Serenity':
// self.prefix = 'https://esi.evepc.163.com/latest/characters/'
// self.suffix = '/?datasource=serenity'

const phin = require('phin')
const $ = require('jquery')
const AppConfig = require('../configuration')

const urls = {
  "status": {
    "tranquility": "https://esi.evetech.net/latest/status/",
    "serenity": "https://esi.evepc.163.com/latest/status/?datasource=serenity"
  }
  
}

function changeServer(server) {
  AppConfig.saveSettings('server', server)
  const lang = AppConfig.readSettings('language') ?? 'zh-CN'
  const locale = require('../locales/' + lang + '.json')
  const title = locale.servers[server]

  const serverTitle = $('#server-title')
  serverTitle.text(title)

  getServerStatus()
}

async function getServerStatus() {
  const server = $('#server-select').val()
  const language = $('#language-select').val()
  const locale = require('../locales/' + language + '.json')
  const serverStatus = $('#server-status')
  const playerCount = $('#player-count')
  let status, players;

  const res = await phin({
    'url': urls.status[server],
    'parse': 'json'
  })
  if (res.statusCode == 504) {
    status = locale.serverStatus.offline
    players = 0
  } else if (res.statusCode == 200) {
    status = locale.serverStatus.online
    players = res.body.players
  }
  console.log(status, players)

  serverStatus.text(status)
  playerCount.text(players)
}


module.exports = {
  changeServer,
  getServerStatus,
}