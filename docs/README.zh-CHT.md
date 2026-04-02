# EVE 設定管理器

**EVE Online 設定管理器**是一款桌面應用程式，用於管理本地 EVE Online 設定檔案——在角色之間複製介面配置、備份和還原設定資料夾、為帳號新增備註，無需啟動遊戲用戶端。

**語言:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md)

---

## 功能

- **伺服器切換** — 支援 Tranquility、Serenity、Singularity、Infinity、Thunderdome，從 EVE 安裝目錄自動偵測
- **設定資料夾管理** — 建立、重新命名、複製、刪除設定資料夾（即 EVE 使用的 `settings_*` 子目錄）
- **角色清單** — 顯示所有角色檔案，透過 ESI API 自動解析角色名稱及最後修改時間
- **帳號清單** — 顯示所有帳號檔案；可為每個帳號新增備註，方便記錄用途
- **同步設定** — 一鍵將某個角色或帳號的介面配置複製到任意多個其他角色/帳號
- **單一檔案備份** — 備份單一角色或帳號檔案，一鍵還原
- **資料夾備份** — 為整個設定資料夾建立命名快照，從側邊欄進行還原或刪除
- **深色 / 淺色主題** — 預設深色，偏好設定跨工作階段保存
- **8 種語言** — English、简体中文、繁體中文、日本語、한국어、Français、Deutsch、Español

---

## 技術堆疊

| 層級 | 函式庫 |
|---|---|
| 桌面外殼 | Electron 29 |
| UI 框架 | Vue 3 + TypeScript |
| 元件庫 | Element Plus |
| 狀態管理 | Pinia |
| 國際化 | vue-i18n |
| 建置工具 | Vite + vite-plugin-electron |
| 持久化 | electron-store |

---

## 快速開始

**前置條件：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 啟動開發伺服器 + Electron（熱重載）
```

### 打包建置

```bash
pnpm build      # 型別檢查、打包並透過 electron-builder 產生安裝檔
```

輸出路徑：`release/<版本號>/`

---

## 資料儲存

所有持久化資料（備註、主題偏好、語言、伺服器記憶、角色名稱快取）均儲存在本地 JSON 檔案中，不會上傳至任何伺服器。

| 平台 | 路徑 |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## 解除安裝

解除安裝應用程式**不會**自動刪除本地資料夾。如需完全清除，請解除安裝後手動刪除以下資料夾：

- **macOS：** `~/Library/Application Support/eve-settings-manager`
- **Windows：** `%APPDATA%\eve-settings-manager`

---

## 授權條款

MIT — 詳見 [LICENSE](../LICENSE)。
