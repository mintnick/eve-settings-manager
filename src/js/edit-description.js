const $ = require('jquery')
const AppConfig = require('../configuration')

function editDescription(args) {
  const select = $(`#${args.type}-select`)
  const option = select.find(`option[value=${args.file}]`)
  const text = option.text()
  const newTextList = args.type == 'char' ? text.split(' - ').slice(0, 3) : text.split(' - ').slice(0, 2)
  newTextList.push(`[${args.savedDescription}]`)
  const newText = newTextList.join(' - ')
  option.text(newText)
  AppConfig.saveSettings(`descriptions.${args.server}.${args.file}`, args.savedDescription)
}

module.exports = {
  editDescription,
}