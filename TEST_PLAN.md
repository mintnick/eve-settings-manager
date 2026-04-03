# EVE Settings Manager — Test Plan

This document covers all tests for the app, split into two categories:

- **[A] Automated** — run with `pnpm test` (no app needed, pure Node.js/Vitest)
- **[M] Manual** — run the app with `pnpm dev` and test by hand

---

## Setup Before Testing

```bash
# Reset test fixtures to a clean state
pnpm reset-fixtures

# Run all automated tests
pnpm test
```

Fixture directory (macOS):
```
~/Library/Application Support/CCP/EVE_test/_test_tranquility/
  settings_Default/
  settings_Custom/
  settings_AltAccounts/
```

---

## PART 1 — Automated Tests (run `pnpm test`)

### 1.1 Profile IPC Handler — `profile.test.ts` (already exists)

| # | Test | What it checks |
|---|------|----------------|
| A1 | `listProfiles` returns sorted list | Profiles are read from fixture dir and sorted A–Z |
| A2 | `createProfile` creates a new dir | New `settings_NewProfile` appears after creation |
| A3 | `deleteProfile` removes a dir | Deleted profile no longer in list |
| A4 | `renameProfile` renames the dir | Old name gone, new name present |

Run: `pnpm test`

---

### 1.2 ✅ Folder IPC — `folder.test.ts`

| # | Test | What it checks |
|---|------|----------------|
| A5 | `findEveFolder` returns path if default dir exists | Returns correct macOS/Windows path |
| A6 | `findEveFolder` returns null if path missing | Handles missing directory gracefully |

---

### 1.3 ✅ Server IPC — `server.test.ts`

| # | Test | What it checks |
|---|------|----------------|
| A7 | `detectServers` finds dirs with known keywords | Picks up `_test_tranquility`, ignores unrelated dirs |
| A8 | `inferEsiServer('tranquility')` returns `'tq'` | Keyword → ESI enum mapping |
| A9 | `inferEsiServer('serenity')` returns `'serenity'` | Same for Serenity |
| A10 | `inferEsiServer('singularity/duality/thunderdome/buckshot')` returns `'other'` | No public ESI for test/tournament servers |
| A10b | `inferEsiServer('unknown')` returns `'tq'` | Graceful fallback to TQ for unrecognised names |

---

### 1.4 ✅ Settings IPC — `settings.test.ts`

| # | Test | What it checks |
|---|------|----------------|
| A11 | `listSettings` finds `core_char_*.dat` files | Regex `/^core_char_(\d+)\.dat$/` matches correctly |
| A12 | `listSettings` finds `core_user_*.dat` files | Regex `/^core_user_(\d+)\.dat$/` matches correctly |
| A13 | `listSettings` ignores non-matching files | `.bak`, `.txt`, etc. are not included |
| A14 | `copySettings` copies file to multiple destinations | Source file is copied to each target path |

---

### 1.5 ✅ Backup IPC — `backup.test.ts`

| # | Test | What it checks |
|---|------|----------------|
| A15 | `createBackup` creates a folder with `.dat` files | Backup folder contains same files as source profile |
| A16 | `listBackups` returns both folder and file backups | Both types appear in sorted list |
| A17 | `restoreBackup` copies files back to profile | Profile files match backup after restore |
| A18 | `deleteBackup` removes backup folder | Folder no longer exists after delete |
| A19 | `createFileBackup` creates single `.dat` in Backups/ | File appears in `<profile>/Backups/` |
| A20 | `restoreFileBackup` copies file back | Target file matches backup file |
| A21 | `deleteFileBackup` removes backup file | File no longer exists |

---

### 1.6 ✅ Store IPC — `store.test.ts`

| # | Test | What it checks |
|---|------|----------------|
| A22 | `setDescription` / `getDescription` round-trip | Stored value is returned correctly |
| A23 | `deleteDescription` removes the value | Returns undefined after delete |
| A24 | `setCustomFolder` / `getCustomFolder` round-trip | Folder path persists |
| A25 | `setLanguage` / `getLanguage` round-trip | Language code persists |
| A26 | `setTheme` / `getTheme` round-trip | Theme name persists |

---

## PART 2 — Manual Tests (run `pnpm dev`)

Start the app first:
```bash
pnpm dev
```

---

### 2.1 Startup & Folder Detection

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M1 | App opens | Launch app | Window opens, dark theme, no errors in console |
| M2 | Auto-detect EVE folder | Open app with EVE installed | Folder is detected, servers tab shows servers |
| M3 | Folder not found | First run without EVE | Empty state message shown, prompt to set folder |
| M4 | Manual folder select | Click "Set Folder" → pick directory | Folder path saved, servers reloaded |
| M5 | Reset folder | Click reset in Settings tab | Returns to auto-detect state |
| M6 | Open folder in shell | Click folder icon next to path | macOS Finder / Windows Explorer opens |

---

### 2.2 Server Selection

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M7 | Server list populates | EVE folder detected | Sidebar shows TQ, Serenity, etc. |
| M8 | Select a server | Click server name | Server becomes active, profiles load |
| M9 | Server status badge | Wait 2–3 seconds after selecting | Green (online) or red (offline) indicator appears |
| M10 | Status refresh | Click refresh | Status badge updates |
| M11 | Last server remembered | Close and reopen app | Previously selected server is active |

---

### 2.3 Profile Tab

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M12 | Profiles list | Select a server | All `settings_*` directories listed |
| M13 | Create profile | Click "+", type name, confirm | New profile appears in list |
| M14 | Create — duplicate name | Try to create with existing name | Error or warning shown |
| M15 | Rename profile | Click rename icon, type new name | Profile renamed in list |
| M16 | Duplicate profile | Click duplicate icon | New profile with same files appears |
| M17 | Delete profile | Click delete icon, confirm warning | Profile removed from list |
| M18 | Delete — cancel | Click delete, then cancel | Nothing deleted |
| M19 | Select profile | Click profile row | Profile becomes active, Settings tab loads its files |
| M20 | Last profile remembered per server | Switch servers and back | Previous profile selection restored |

---

### 2.4 Settings Tab

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M21 | Character files listed | Select a profile with `.dat` files | `core_char_*` rows appear with character IDs |
| M22 | Character names resolved | Wait a moment with internet | Character IDs replaced with names via ESI |
| M23 | Account files listed | Same profile | `core_user_*` rows appear |
| M24 | Add a note | Click notes field, type text, confirm | Note saved and shown |
| M25 | Edit a note | Change existing note | Updated note shown |
| M26 | Delete a note | Clear note field | Note removed |
| M27 | Notes persist | Close and reopen app, select same profile | Notes still shown |
| M28 | Sync settings — one source to one target | Select source file, pick target, confirm | Target file updated (check file mod date) |
| M29 | Sync settings — one source to multiple targets | Select source, pick multiple targets | All targets updated |
| M30 | Sync — cancel | Open sync dialog, click cancel | No files changed |
| M31 | Open file in shell | Click "reveal file" icon | macOS Finder reveals the `.dat` file |

---

### 2.5 Backups Tab

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M32 | Empty backup list | No backups created yet | Empty state message shown |
| M33 | Create folder backup | Click "Create Backup", enter name, confirm | Backup appears in list with timestamp |
| M34 | Create — duplicate name | Create backup with same name twice | Error or warning shown |
| M35 | Restore folder backup | Click restore on a backup, confirm warning | Profile `.dat` files replaced |
| M36 | Delete folder backup | Click delete, confirm | Backup removed from list |
| M37 | Create single-file backup | Select a `.dat` file, click backup icon | Single file backup appears in list |
| M38 | Restore single-file backup | Click restore on file backup, confirm | That one file restored |
| M39 | Delete single-file backup | Click delete, confirm | File backup removed |
| M40 | Backup list sorted | Create multiple backups | Newest first |

---

### 2.6 Settings Tab (App Settings)

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M41 | Theme toggle — dark→light | Click sun/moon icon | UI switches to light theme immediately |
| M42 | Theme toggle — light→dark | Click again | Back to dark |
| M43 | Theme persists | Toggle, close, reopen app | Theme remembered |
| M44 | Language switch | Change language in Settings | All UI labels change to selected language |
| M45 | Language persists | Change language, close, reopen | Language setting remembered |
| M46 | All 8 languages render | Cycle through each | No broken/missing translation strings (no raw keys shown) |

---

### 2.7 UI & Window Behaviour

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M47 | Window resize | Drag window to new size | Layout responds correctly, no overflow |
| M48 | Window size persists | Resize, close, reopen | Window opens at same size/position |
| M49 | GitHub button | Click GitHub icon in header | Opens GitHub repo in default browser (not in-app) |
| M50 | Single instance lock | Open app, try to open a second instance | Second instance does not open; first window focuses |
| M51 | External links in app | Any clickable link in the UI | Opens in browser, not in Electron window |

---

### 2.8 Error & Edge Cases

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M52 | Profile with no `.dat` files | Create empty profile, view in Settings tab | Empty state shown gracefully |
| M53 | Network offline | Disable internet, refresh server status | Error state or offline indicator shown, no crash |
| M54 | Network offline — ESI names | Open Settings tab while offline | Character IDs shown (fallback, no crash) |
| M55 | Corrupted/invalid folder | Set custom folder to a non-EVE directory | Graceful empty state, no crash |
| M56 | Long profile/character names | Create profile with a very long name | Name truncates or wraps, layout not broken |

---

## Quick Reference — Test Count

| Category | Count |
|----------|-------|
| Automated | 74 (6 files, all passing) |
| Manual | 56 (M1–M56) |
| **Total** | **130** |

---

## Recommended Order

1. Run automated tests: `pnpm test` → confirm all 74 pass
2. Manual: work through M1–M11 (startup + server detection)
3. Manual: M12–M20 (profile tab)
4. Manual: M21–M31 (settings tab)
5. Manual: M32–M40 (backups tab)
6. Manual: M41–M56 (settings, UI, edge cases)
