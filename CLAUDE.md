# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EVE Online Settings Manager** — a desktop app (Electron + Vue 3 + TypeScript + Vuetify) for managing local EVE Online settings files (per-character and per-account).

The `electron-vue-refactor` branch is an in-progress rewrite of the legacy vanilla JS app (on `main`). The new stack is boilerplate-ready but the EVE-specific logic has not yet been ported.

## Commands

```bash
pnpm dev          # Start dev server + Electron (hot reload)
pnpm build        # Type-check, build renderer + electron, package with electron-builder
pnpm preview      # Preview the Vite build
```

No test runner is configured yet.

## Architecture

This is a standard `vite-plugin-electron` project with three distinct processes:

**Main process** (`electron/main/index.ts`)
- Runs in Node.js. Creates the `BrowserWindow`, handles single-instance lock, and registers IPC handlers.
- Exposes `ipcMain.handle('open-win', ...)` for opening child windows.
- Built to `dist-electron/main/`.

**Preload script** (`electron/preload/index.ts`)
- Bridges main ↔ renderer via `contextBridge.exposeInMainWorld('ipcRenderer', ...)`.
- Also injects a CSS loading spinner that is removed once the renderer signals ready (`postMessage({ payload: 'removeLoading' }, '*')`).
- Built to `dist-electron/preload/`.

**Renderer process** (`src/`)
- Vue 3 SPA with Vuetify (Material Design). Entry: `src/main.ts` → `src/App.vue`.
- Vuetify is registered globally with all components and directives imported.
- `src/demos/ipc.ts` shows how to call the preload-exposed `ipcRenderer` from Vue.

**IPC pattern**: renderer calls `window.ipcRenderer.invoke(channel, ...args)` → main handles via `ipcMain.handle(channel, handler)`. All Node.js/filesystem work must happen in the main process and be exposed through named IPC channels.

**Build output**:
- `dist/` — Vite-built renderer (HTML/JS/CSS)
- `dist-electron/` — compiled main + preload
- `release/${version}/` — electron-builder packaged app (dmg/nsis/AppImage)

## Key Config Files

- `vite.config.ts` — configures both the renderer build and electron main/preload builds via `vite-plugin-electron/simple`
- `electron-builder.json5` — packaging config; `appId` and `productName` are placeholder values that need to be updated
- `tsconfig.json` — covers `src/` (renderer); `tsconfig.node.json` covers Vite config and electron source
