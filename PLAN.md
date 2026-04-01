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
- [ ] Profile tabs — add/rename/delete actions
- [x] Sync settings — icon (Share, green) + backup icon (DocumentCopy, muted blue); picker dialog pre-checks all, select-all toggle; char/account tooltips distinct
- [x] Single file backup — auto-named from filename (no dialog); put-back button in sidebar (RefreshLeft icon) with overwrite warning
- [x] Sidebar backup items — delete button (Delete icon, red); Document/Files icons for file/folder types; action buttons 18px; tooltips on top; creation date shown in meta line (date only); backup dialog default name is profile name only (no date suffix)
- [ ] Named per-file snapshots (Saved Settings)

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
