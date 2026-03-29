import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './style.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { i18n } from './i18n'

createApp(App)
  .use(createPinia())
  .use(ElementPlus)
  .use(i18n)
  .mount('#app')
  .$nextTick(() => {
    document.documentElement.style.setProperty('--el-font-size-extra-large', '22px')
    document.documentElement.style.setProperty('--el-font-size-large', '20px')
    document.documentElement.style.setProperty('--el-font-size-medium', '18px')
    document.documentElement.style.setProperty('--el-font-size-base', '16px')
    document.documentElement.style.setProperty('--el-font-size-small', '15px')
    document.documentElement.style.setProperty('--el-font-size-extra-small', '14px')
    postMessage({ payload: 'removeLoading' }, '*')
  })
