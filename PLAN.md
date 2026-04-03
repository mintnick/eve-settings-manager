# EVE Settings Manager — Plan

## Remaining Feature: Named Per-File Snapshots ("Saved Settings")

Save a single character or account's `.dat` file under a custom name and restore it onto any character at any time, independently of the full backup system.

**How it works:**
- Each character or account row has a "Save as..." action
- User gives it a name (e.g. "PvP overview", "Station trading UI")
- The `.dat` file is copied into a `Saved/` folder inside the profile dir
- A saved settings panel lists all snapshots; any can be applied to one or more characters/accounts

**Storage:**
```
settings_Default/
  core_char_12345.dat
  core_user_67890.dat
  Backups/
    Full Backup 2025-03-01/
  Saved/
    my pvp settings.dat
    station trading UI.dat
```

**Metadata** (in `electron-store`): snapshot name → source file type (char/user), server, creation date, optional notes.

**Status:** `useSavedSettingsStore` is a stub — IPC not yet implemented.

---

## Distribution

**Build:** `pnpm build` → `release/2.0.0/` (Mac only on Mac; CI handles cross-platform)

**Targets:**
- macOS → `.dmg` (unsigned, `identity: null`)
- Windows → portable `.exe` (x64)
- Linux → `.AppImage`

**Artifact naming:** `EVE Settings Manager-{Mac|Windows|Linux}-{version}.{ext}`

**GitHub Actions:** `.github/workflows/build.yml`
- Triggers on push to `electron-vue-refactor`
- Matrix build: macOS, Windows, Ubuntu in parallel
- Artifacts available in Actions tab → run → Artifacts (no public release yet)
- `pnpm-lock.yaml` committed — required for CI cache
