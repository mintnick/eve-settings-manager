'use strict';

const Store = require('electron-store')

const store = new Store()

function saveSettings(settingKey, settingValue) {
  store.set(settingKey, settingValue)
}

function readSettings(settingKey) {
  return store.get(settingKey);
}

function clear() {
  store.clear()
}

module.exports = {
  saveSettings,
  readSettings,
  clear,
};