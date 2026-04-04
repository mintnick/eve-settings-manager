# EVE Settings Manager

**EVE Online Settings Manager** is a desktop app for managing your local EVE Online settings files — copy character layouts between toons, back up and restore profiles, and keep notes on each account, all without touching the game client.

**Languages / 语言:**
[简体中文](docs/README.zh-CN.md) · [繁體中文](docs/README.zh-CHT.md) · [Русский](docs/README.ru.md) · [Deutsch](docs/README.de.md) · [Français](docs/README.fr.md) · [Español](docs/README.es.md) · [Português (BR)](docs/README.pt-BR.md) · [한국어](docs/README.ko.md) · [日本語](docs/README.ja.md) · [Polski](docs/README.pl.md)

---

## Features

- **Server switching** — Tranquility, Serenity, Singularity, Infinity, Thunderdome; auto-detected from your EVE install folder
- **Profile management** — create, rename, duplicate, and delete settings profiles (the `settings_*` subdirectories EVE uses)
- **Character table** — lists all character files with ESI-resolved names and last-modified timestamps
- **Account table** — lists all account files; add a personal note to each account to help you remember what it's for
- **Sync settings** — copy one character or account's UI layout to any number of others in one click
- **File backup** — save a single character or account file; restore it back with one click
- **Folder backup** — create a named snapshot of the entire profile; restore or delete from the sidebar
- **Dark / light theme** — dark by default, follows system theme on first launch; preference saved across sessions
- **11 languages** — English, 简体中文, 繁體中文, Русский, Deutsch, Français, Español, Português (BR), 한국어, 日本語, Polski

---

## Tech Stack

| Layer | Library |
|---|---|
| Desktop shell | Electron 41 |
| UI framework | Vue 3 + TypeScript |
| Component library | Element Plus |
| State management | Pinia |
| Internationalisation | vue-i18n |
| Build tool | Vite + vite-plugin-electron |
| Persistence | electron-store |

---

## Getting Started

1. Go to the [Releases](https://github.com/mintnick/eve-settings-manager/releases) page.
2. Download the file for your platform:
   - **macOS:** `.dmg` — open it and drag the app to Applications
   - **Windows:** `.exe` — run it directly, no installation needed

> **macOS note:** The app is not yet code-signed. On first launch macOS may say it is "damaged and can't be opened". The most reliable fix is to run the following in Terminal, then open the app normally:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternatively, macOS shows an **Open Anyway** button in System Settings → Privacy & Security for a short time (~1 hour) after the blocked launch. If you don't see it, use the Terminal command above instead.

---

## Data Storage

All persistent data is stored locally — nothing is sent to any server.

| Platform | Config | Backups |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## Uninstalling

- **macOS:** Delete the app from Applications. The local data folder is **not** removed automatically — delete it manually if you want a clean uninstall: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Delete the `.exe` file. Also delete the data folder if you want to remove everything: `%APPDATA%\eve-settings-manager`

---

## Building from Source

**Prerequisites:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # start dev server + Electron (hot reload)
```

```bash
pnpm build      # type-check, bundle, and package with electron-builder
```

Output is written to `release/<version>/`.

---

## License

MIT — see [LICENSE](LICENSE).
