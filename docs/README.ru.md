# EVE Settings Manager

**EVE Online Settings Manager** — десктопное приложение для управления локальными файлами настроек EVE Online: копируйте раскладки интерфейса между персонажами, создавайте резервные копии и восстанавливайте профили, добавляйте заметки к аккаунтам — без запуска игрового клиента.

**Языки:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Начало работы

1. Перейдите на страницу [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest).
2. Загрузите файл для вашей платформы:
   - **macOS:** `.dmg` — откройте и перетащите приложение в папку Applications
   - **Windows:** `.exe` — запустите напрямую, установка не требуется
   - **Linux:** `.AppImage` — сделайте исполняемым и запустите

> **Примечание для macOS:** Приложение ещё не подписано кодом. При первом запуске macOS может сообщить, что оно «повреждено и не может быть открыто». Наиболее надёжный способ исправить это — выполнить следующую команду в Терминале, а затем открыть приложение обычным способом:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Также в течение примерно 1 часа после заблокированного запуска в разделе Системные настройки → Конфиденциальность и безопасность появится кнопка **Всё равно открыть**. Если кнопка не отображается, используйте команду Терминала выше.

---

## Хранение данных

Все постоянные данные хранятся локально — ничто не отправляется на внешние серверы.

| Платформа | Локальные данные |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## Удаление

- **macOS:** Удалите приложение из папки Applications. Локальная папка с данными **не удаляется автоматически** — при необходимости удалите её вручную: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Удалите файл `.exe`. Для полного удаления также удалите папку с данными: `%APPDATA%\eve-settings-manager`
- **Linux:** Удалите файл `.AppImage`. Для полного удаления также удалите папку с данными: `~/.config/eve-settings-manager`

---

## Сборка из исходного кода

**Требования:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # запуск dev-сервера + Electron (горячая перезагрузка)
pnpm build      # проверка типов, сборка и упаковка через electron-builder
```

---

## Отказ от ответственности

EVE Online® и все связанные названия, логотипы и ресурсы являются собственностью CCP Games. Данный проект не аффилирован с CCP Games и не одобрен ею.

---

## Лицензия

MIT — см. [LICENSE](../LICENSE).
