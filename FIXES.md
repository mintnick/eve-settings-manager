# Bug Fix Plan

Findings from a codebase review, verified against the code. Ordered by priority.

---

## Fix 1 — `pnpm build` broken on macOS (BLOCKER)

**File:** `electron-builder.json5`

**Problem:** `pnpm build` fails during macOS packaging with ENOENT trying to rename `Electron.app/Contents/MacOS/Electron` → `EVE Settings Manager`. Known compatibility issue between electron-builder 26.x and Electron 41 on macOS arm64.

**Fix:**
1. Add `"executableName": "EVE Settings Manager"` to the `mac` block in `electron-builder.json5` — lets the packager resolve the binary name explicitly.
2. If that does not resolve it, investigate whether a patch release of electron-builder 26 addresses Electron 41 arm64, or pin Electron to a version known-good with builder 26.

---

## Fix 2 — Restore does not refresh renderer state

**File:** `src/stores/useBackupStore.ts`

**Problem:** `restoreBackup` (line 38) and `restoreFileBackup` (line 44) call the IPC and return — no reload. Create, delete, and `syncSettings` all reload after their IPC call. After a restore, the sidebar and settings table show stale data until a profile change forces a reload.

**Fix:** Call `loadBackups()` after each restore IPC call (consistent with create/delete). Additionally trigger `useSettingsStore().loadSettings()` since restored files affect the settings table too.

---

## Fix 3 — Folder detection priority inverted

**File:** `src/stores/useServerStore.ts` (line 19–21)

**Problem:** The comment says "explicit custom path (e.g. dev fixture), then stored user override, then OS default." The code does `savedFolder || customPath`, so a stored folder always beats a passed-in `customPath`. This breaks fixture-based dev startup when a custom folder has been saved.

**Fix:** Swap the operands: `customPath || savedFolder || undefined`.

---

## Fix 4 — ESI mapping incorrect for test/tournament servers

**File:** `electron/main/ipc/server.ts`, `electron/main/ipc/__tests__/server.test.ts`

**Problem:** `inferEsiServer` fell through to `'tq'` for Singularity, Duality, and Buckshot.

**Resolution (updated after further research):** Singularity's `datasource=singularity` ESI parameter was **removed by CCP on January 14, 2020** — it never had a usable public endpoint after that date. Duality is retired. "Buckshot" is CCP's internal folder name for the **Thunderdome** tournament server, which also has no public ESI. All three map to `'other'`.

**Fix applied:**
- `EsiServer` type is `'tq' | 'serenity' | 'infinity' | 'other'` — no `'singularity'` variant needed.
- `inferEsiServer` returns `'other'` for singularity, duality, thunderdome, and buckshot.
- `SERVER_KEYWORDS` updated: buckshot display name corrected to "Thunderdome"; `thunderdome` keyword added alongside it.
- `getServerStatus` and `resolveCharNames` skip ESI for `'other'` — return `{ online: false }` and cached names only.

---

## Fix 5 — Stale developer docs

**Files:** `CLAUDE.md`, `README.md`, `TEST_PLAN.md`

**`CLAUDE.md` changes:**
- "Vuetify" → Element Plus
- Remove "EVE-specific logic has not yet been ported"
- Remove "No test runner is configured yet" — replace with actual test command and count
- Remove "`appId` and `productName` are placeholder values" — they're set

**`README.md` changes:**
- Tech stack table: Electron 29 → 41

**`TEST_PLAN.md` changes:**
- Mark sections 1.2–1.6 (A5–A26) as complete (all files exist, 72 tests pass)
- Update Quick Reference counts (existing: 72, to write: 0)
- Update recommended order to reflect current state
