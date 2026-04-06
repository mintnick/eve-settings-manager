# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EVE Online Settings Manager** — a desktop app (Electron + Vue 3 + TypeScript + Element Plus) for managing local EVE Online settings files (per-character and per-account).

The app is feature-complete and actively maintained on `main`.

## Commands

```bash
pnpm dev          # Start dev server + Electron (hot reload)
pnpm build        # Type-check, build renderer + electron, package with electron-builder
pnpm test         # Run all automated tests (Vitest, 72 tests across 6 IPC test files)
pnpm reset-fixtures  # Reset test fixture files to a clean state
```

## Architecture

Three distinct processes:

**Main process** (`electron/main/index.ts`)
- Runs in Node.js. Creates the `BrowserWindow`, handles single-instance lock, registers IPC handlers via `registerIpcHandlers()`.
- Built to `dist-electron/main/`.

**Preload script** (`electron/preload/index.ts`)
- Bridges main ↔ renderer via `contextBridge.exposeInMainWorld('ipcRenderer', ...)`.
- Built to `dist-electron/preload/`.

**Renderer process** (`src/`)
- Vue 3 SPA with Element Plus. Entry: `src/main.ts` → `src/App.vue`.
- State managed via Pinia stores in `src/stores/`. i18n via vue-i18n (`src/i18n/`).

**IPC pattern**: renderer calls `window.ipcRenderer.invoke(channel, ...args)` → main handles via `ipcMain.handle(channel, handler)`. All Node.js/filesystem work must happen in the main process and be exposed through named IPC channels. Channels are registered in `electron/main/ipc/index.ts`.

**Build output**:
- `dist/` — Vite-built renderer (HTML/JS/CSS, ~1.4MB)
- `dist-electron/` — compiled main + preload (~380KB, includes electron-store bundled in)
- `release/${version}/` — electron-builder packaged app (dmg/exe/AppImage)

## Dependency Architecture

All packages are in `devDependencies`. There are no runtime `dependencies`.

- **Renderer packages** (element-plus, pinia, vue-i18n, @element-plus/icons-vue, vue) — bundled by Vite into `dist/assets/index.js`, tree-shaken to ~1MB.
- **Main process packages** (electron-store) — bundled by Vite into `dist-electron/main/index.js`. electron-store has no native addons so this works cleanly.
- **electron-builder** reads `dependencies` to decide what node_modules to copy into the asar. With an empty `dependencies`, no node_modules are bundled — app.asar is ~1.8MB instead of 64MB.

## Key Config Files

- `vite.config.ts` — renderer + main/preload builds via `vite-plugin-electron/simple`. The `external` list is built from `pkg.dependencies` (currently empty, so everything is bundled).
- `electron-builder.json5` — packaging config; targets dmg/portable exe/AppImage.
- `tsconfig.json` — covers `src/` (renderer); `tsconfig.node.json` covers Vite config and electron source.

## Key Technical Decisions

**HTTP in main process:** All HTTP calls use `node:https` directly (see `electron/main/ipc/http.ts`). Avoids Chromium's network stack which can crash during GPU init on some machines.

**GPU crash in dev:** Closing the window in `pnpm dev` sometimes logs a GPU/network service error. Cosmetic only — restart with `pnpm dev`.

**Custom folder priority:** On startup: dev fixture path (`VITE_FIXTURE_PATH` from `.env.development`) → saved user override → OS default. Set in `useServerStore.detectFolder()`.

**Dev fixture path:** `.env.development` sets `VITE_FIXTURE_PATH` to a local test EVE folder. Not committed (in `.gitignore`). Ignored in production builds (Vite only loads `.env.development` during `pnpm dev`).

**ESI servers:** Only TQ, Serenity, and Infinity have public ESI endpoints. Singularity's datasource was removed by CCP in January 2020. Thunderdome (folder keyword: `buckshot`) and Duality have no ESI. All non-ESI servers map to `EsiServer = 'other'` and skip ESI calls.

**Default server selection:** App defaults to TQ-like servers (name contains "tranquil"). Last-selected server saved via `store:set-last-server`.

**Font size:** Overridden via JS after mount (`document.documentElement.style.setProperty`) because Element Plus CSS loads after `style.css` and would override `:root` declarations.

**Window state:** `electron/main/index.ts` uses a separate `ElectronStore` (`name: 'window-state'`) to persist window bounds.
