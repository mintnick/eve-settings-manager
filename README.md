# EVE Settings Manager

**EVE Online Settings Manager** is a desktop app for managing your local EVE Online settings files — copy character layouts between toons, back up and restore profiles, and keep notes on each account, all without touching the game client.

**Languages / 语言:**
[简体中文](docs/README.zh-CN.md) · [繁體中文](docs/README.zh-CHT.md) · [日本語](docs/README.ja.md) · [한국어](docs/README.ko.md) · [Français](docs/README.fr.md) · [Deutsch](docs/README.de.md) · [Español](docs/README.es.md)

---

## Features

- **Server switching** — Tranquility, Serenity, Singularity, Infinity, Thunderdome; auto-detected from your EVE install folder
- **Profile management** — create, rename, duplicate, and delete settings profiles (the `settings_*` subdirectories EVE uses)
- **Character table** — lists all character files with ESI-resolved names and last-modified timestamps
- **Account table** — lists all account files; add a personal note to each account to help you remember what it's for
- **Sync settings** — copy one character or account's UI layout to any number of others in one click
- **File backup** — save a single character or account file; restore it back with one click
- **Folder backup** — create a named snapshot of the entire profile; restore or delete from the sidebar
- **Dark / light theme** — dark by default; preference saved across sessions
- **8 languages** — English, 简体中文, 繁體中文, 日本語, 한국어, Français, Deutsch, Español

---

## Tech Stack

| Layer | Library |
|---|---|
| Desktop shell | Electron 29 |
| UI framework | Vue 3 + TypeScript |
| Component library | Element Plus |
| State management | Pinia |
| Internationalisation | vue-i18n |
| Build tool | Vite + vite-plugin-electron |
| Persistence | electron-store |

---

## Getting Started

**Prerequisites:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # start dev server + Electron (hot reload)
```

### Build

```bash
pnpm build      # type-check, bundle, and package with electron-builder
```

Output is written to `release/<version>/`.

---

## Data Storage

All persistent data (notes, theme preference, language, server memory, character name cache) is stored locally in a single JSON file — nothing is sent to any server.

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## Uninstalling

Uninstalling the app does **not** remove the local data folder. To delete everything completely, uninstall the app and then manually delete the data folder:

- **macOS:** `~/Library/Application Support/eve-settings-manager`
- **Windows:** `%APPDATA%\eve-settings-manager`

---

## License

MIT — see [LICENSE](LICENSE).
