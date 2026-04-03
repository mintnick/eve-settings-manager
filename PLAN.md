# Refactor Plan: EVE Settings Manager

## What the current app does (baseline)

- **Server switching**: Tranquility, Serenity, Singularity, Infinity, Thunderdome — filters the EVE settings folder by server name
- **Folder detection**: Auto-finds `AppData/Local/CCP/EVE` (Win) or `Library/Application Support/CCP/EVE` (Mac), supports manual override
- **Profiles**: Lists `settings_*` subdirectories (e.g. `settings_Default`, `settings_MyProfile`) — added by a contributor after EVE Online introduced the profile feature
- **Characters** (`core_char_*.dat`): Lists files with name from ESI API, last-modified time, user-added description
- **Accounts** (`core_user_*.dat`): Same but no character name
- **Overwrite**: Copy one char/account's settings to all others, or a user-selected subset
- **Backup**: Dumps current profile's `.dat` files into a timestamp-named subfolder — no restore
- **Descriptions**: Arbitrary text labels saved per file in `electron-store`
- **i18n**: en, zh-CN, zh-CHT via local JSON files

---

## Architecture

### Phase 1 — IPC & Data Layer (Main Process)

Port all filesystem logic from the old vanilla JS into typed IPC handlers in `electron/main/`. Each feature area gets its own handler module:

| Module | Handles |
|---|---|
| `ipc/server.ts` | detect available servers, fetch server status from ESI |
| `ipc/folder.ts` | find EVE install paths, manual folder selection |
| `ipc/profile.ts` | list/create/rename profiles |
| `ipc/settings.ts` | read char & user `.dat` files, resolve char names via ESI |
| `ipc/backup.ts` | create named backups, list backups, restore from backup |
| `ipc/store.ts` | all persistent config via `electron-store` |

The renderer never touches the filesystem — it only calls `ipcRenderer.invoke()`.

### Phase 2 — Vue 3 State Layer (Renderer)

Use **Pinia** (lightweight, Vue 3-native) with one store per domain:

- `useServerStore` — current server, status, player count
- `useProfileStore` — current EVE folder, current profile
- `useSettingsStore` — char list, user/account list, ESI name cache
- `useBackupStore` — list of named backups
- `useSavedSettingsStore` — list of named per-file snapshots

### Phase 3 — UI (Element Plus)

No top bar. 2-panel layout with sidebar + main content area:

```
┌───────────┬──────────────────────────────────────────┐
│           │  [Profile tabs]                           │
│  Sidebar  ├──────────────────┬───────────────────────┤
│           │   Characters     │   Accounts            │
│  Servers  │   (data table)   │   (data table)        │
│  Backups  │                  │                       │
│  Saved    ├──────────────────┴───────────────────────┤
│           │  [Action bar: Copy · Backup · Open]      │
└───────────┴──────────────────────────────────────────┘
```

**UI parts to detail and refine:**
- [x] Sidebar — servers section, folder buttons, backups section, language selector
- [x] Sidebar polish — translate icon, bottom bar alignment, backup reveal button, tooltip fade-out
- [x] Characters table — columns, row actions, empty state
- [x] Accounts table — columns, row actions, empty state
- [x] Action bar — centered buttons, stable min-width across languages
- [x] Dialogs — backup name dialog; file backup is auto-named (no dialog)
- [x] Empty / no-folder state
- [x] i18n — vue-i18n, 8 languages (en, zh-CN, zh-CHT, ja, ko, fr, de, es); all keys fully translated
- [x] Profile tabs — add/rename/delete/duplicate actions (`+` button, `⋯` dropdown, name validation, warn dialog for delete, auto-select after all ops)
- [x] Sync settings — icon (Share, green) + backup icon (DocumentCopy, muted blue); picker dialog pre-checks all, select-all toggle; char/account tooltips distinct
- [x] Single file backup — auto-named from filename (no dialog); put-back button in sidebar (RefreshLeft icon) with overwrite warning
- [x] Sidebar backup items — delete button (Delete icon, red); Document/Files icons for file/folder types; action buttons 18px; tooltips on top; two-line meta (creation date + file count label); sidebar 240px; backup dialog default name is profile name only
- [x] Table polish — row action icons 18px; table cell font 15px; row height increased (padding 10px); hover highlight (primary-light-8); bottom border removed; char/account table flex 3:2; Modified col 150px; char name min-width 45px; account ID min-width 110px
- [x] Theme toggle — dark/light switch in action bar (bottom-right); dark mode default on first launch; preference persisted via electron-store; light theme uses softer gray-blue (#e8eaef base) to reduce eye strain
- [x] GitHub button in action bar right — opens repo in system browser via shell.openExternal; order: theme | github (new buttons added to the right)

---

## Features

### Named Backup & Restore (new)

- Backup dialog prompts for a name (pre-filled with timestamp)
- Backups stored in a `_backups/` folder inside the profile directory
- Backup manager view: lists backups with name, date, file count
- Restore: copies files back with confirmation; optionally creates a safety backup first

### Named Per-File Snapshots — "Saved Settings" (new)

Save a single character or account's `.dat` file under a custom name and restore it onto any character at any time, independently of the full backup system.

**How it works:**
- Each character or account row has a "Save as..." action
- User gives it a name (e.g. "PvP overview", "Station trading UI")
- The `.dat` file is copied into a `_saved/` folder alongside `_backups/`
- Saved settings panel lists all snapshots; any can be applied to one or more characters/accounts

**Storage structure:**
```
settings_Default/
  core_char_12345.dat
  core_user_67890.dat
  _backups/
    Full Backup 2025-03-01/
      core_char_12345.dat
      core_user_67890.dat
  _saved/
    my pvp settings.dat
    station trading UI.dat
```

**Metadata** (in `electron-store`): snapshot name → source file type (char/user), server, creation date, optional notes.

### Better Server & Folder Handling (improved)

- Auto-detect available servers from the filesystem on startup (no hardcoded list)
- Live status badge (online/offline/player count) next to server name, auto-refreshing
- Per-server remember last used folder + profile separately
- Clear UI for when EVE isn't installed or path can't be found

### Profile Management (improved)

- Profile shown as tabs or a prominent dropdown, not a plain `<select>`
- Highlight the "Default" profile
- Ability to create a new profile or duplicate an existing one

### i18n

- Keep en, zh-CN, zh-CHT support
- Move locale strings into Vue i18n (vue-i18n) rather than custom JSON loading

---

## Implementation Order

1. Set up Pinia + define store interfaces
2. Port IPC layer (main process) with TypeScript types
3. Server selector + folder detection UI
4. Character/account table
5. Backup management
6. Named per-file snapshots (Saved Settings)
7. Profile management improvements

---

## Distribution

**Build tool:** electron-builder 26.8.2 (confirmed still best-in-class for cross-platform packaging).

**Targets:**
- macOS → `.dmg` (unsigned, `identity: null`)
- Windows → portable `.exe` (x64, no installer)
- Linux → `.AppImage`

**Artifact naming:** `EVE Settings Manager-{Mac|Windows|Linux}-{version}.{ext}`

**GitHub Actions:** `.github/workflows/build.yml`
- Triggers on push to `electron-vue-refactor`
- Matrix build: macOS, Windows, Ubuntu runners in parallel
- Artifacts uploadable from Actions tab → run → Artifacts section (no public release)
- Uses `pnpm` with `node-linker=hoisted` (.npmrc)
- `pnpm-lock.yaml` is committed (required for CI cache)

**Local build:** `pnpm build` — produces `release/2.0.0/` with all three platform files (Mac only on Mac).

---

## TODO

Items from beta feedback — move or delete after implemented.

- **Global backup path** — move all backups to a single global location (app data dir) so backups from all profiles are visible in one list. Each entry should show its source profile. Any backup can be restored to the currently active profile.
- **Delete backup confirmation wording** — current message reads ambiguously (sounds like deleting the actual settings file). Reword to something like "Delete this backup? Your current settings will not be affected."
- **Account notes clear button** — when a note has content, show a quick clear button to wipe it without having to manually select and delete the text.
- **Light mode polish** — hover states need to be darker/more visible; topbar, sidebar, and bottom bar colors need better contrast and visual distinction.
- **Bottom bar buttons** — all buttons in the bottom action bar should be the same size.
- **Help/instructions button** — add a button to the bottom-right alongside the theme and GitHub buttons. Opens the README in the user's current language (e.g. `docs/README.zh-CN.md` for Chinese users, English README as fallback). Could open in system browser or a simple in-app dialog.
- **Server list title** — make the "Servers" section title slightly larger and centered; add i18n translation; consider adding an icon and/or tooltip.
- **Profile action labels** — the `⋯` dropdown actions should all specify "profile": "Rename Profile", "Duplicate Profile", "Delete Profile" (currently only Delete mentions profile).
- **Backup reminder logic** — restore/put-back dialogs should NOT suggest backing up first (the user is already restoring from a backup). The sync/overwrite picker dialog SHOULD suggest backing up first, since it overwrites live settings files.
- **OS theme detection on first launch** — after light mode is polished, restore system theme detection (`prefers-color-scheme`) so the app defaults to the user's OS theme on first open instead of always defaulting to dark.
- **Localized READMEs — macOS note** — propagate the updated macOS Gatekeeper note (including the "Open Anyway disappears after ~1 hour" explanation) to all 7 language docs (`docs/README.zh-CN.md`, `zh-CHT`, `ja`, `ko`, `fr`, `de`, `es`).
- **Additional i18n languages** — Russian (`ru`) is the highest priority given EVE's historically large Russian playerbase. Also consider Portuguese (`pt-BR`) and Polish (`pl`). Requires new locale JSON files, new docs README, and adding to the language selector.
- **Table section titles** — center-align the "Characters" and "Accounts" section titles above each table.
- **App icons** — create/refine proper app icons for all platforms (macOS `.icns`, Windows `.ico`, Linux `.png`).
- **README default page promotion** — the root `README.md` should better promote the app with screenshots, feature highlights, and download links up front.
