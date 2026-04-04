import { createI18n } from 'vue-i18n'
import en from './en'
import zhCN from './zh-CN'
import zhCHT from './zh-CHT'
import ja from './ja'
import ko from './ko'
import fr from './fr'
import de from './de'
import es from './es'
import ru from './ru'
import ptBR from './pt-BR'
import pl from './pl'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-CHT': zhCHT,
    ja,
    ko,
    fr,
    de,
    es,
    ru,
    'pt-BR': ptBR,
    pl,
  },
})
