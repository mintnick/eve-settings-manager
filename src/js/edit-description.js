'use strict';

const $ = require('jquery')
const AppConfig = require('../configuration')

// @param args {
//  type: char/user,
//  file: filename w/o .dat,
//  server: server,
//  savedDescription: user input,
// }
function editDescription(args) {
  const select = $(`#${args.type}-select`)
  const option = select.find(`option[value=${args.file}]`)
  const text = option.text()
  const newTextList = args.type == 'char' ? text.split(' - ').slice(0, 3) : text.split(' - ').slice(0, 2)
  if (args.savedDescription && args.savedDescription !== '') newTextList.push(`[${args.savedDescription}]`)
  const newText = newTextList.join(' - ')
  option.text(newText)
  AppConfig.saveSettings(`descriptions.${args.server}.${args.file}`, args.savedDescription)
}

module.exports = {
  editDescription,
}