# EVE 設定管理器

**EVE Online 設定管理器**是一款桌面應用程式，用於管理本地 EVE Online 設定檔案——在角色之間複製介面配置、備份和還原設定資料夾、為帳號新增備註，無需啟動遊戲用戶端。

**語言:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 功能

- **伺服器切換** — 支援 Tranquility、Serenity、Singularity、Infinity、Thunderdome，從 EVE 安裝目錄自動偵測
- **設定資料夾管理** — 建立、重新命名、複製、刪除設定資料夾（即 EVE 使用的 `settings_*` 子目錄）
- **角色清單** — 顯示所有角色檔案，透過 ESI API 自動解析角色名稱及最後修改時間
- **帳號清單** — 顯示所有帳號檔案；可為每個帳號新增備註，方便記錄用途
- **同步設定** — 一鍵將某個角色或帳號的介面配置複製到任意多個其他角色/帳號
- **單一檔案備份** — 備份單一角色或帳號檔案，一鍵還原
- **資料夾備份** — 為整個設定資料夾建立命名快照，從側邊欄進行還原或刪除
- **深色 / 淺色主題** — 預設深色，首次啟動時跟隨系統主題；偏好設定跨工作階段保存
- **11 種語言** — English、简体中文、繁體中文、Русский、Deutsch、Français、Español、Português (BR)、한국어、日本語、Polski

---

## 技術堆疊

| 層級 | 函式庫 |
|---|---|
| 桌面外殼 | Electron 41 |
| UI 框架 | Vue 3 + TypeScript |
| 元件庫 | Element Plus |
| 狀態管理 | Pinia |
| 國際化 | vue-i18n |
| 建置工具 | Vite + vite-plugin-electron |
| 持久化 | electron-store |

---

## 快速開始

1. 前往 [Releases](https://github.com/mintnick/eve-settings-manager/releases) 頁面。
2. 下載適合你平台的檔案：
   - **macOS：** `.dmg` — 開啟後將應用程式拖曳至 Applications 資料夾
   - **Windows：** `.exe` — 直接執行，無需安裝

> **macOS 注意：** 本應用程式尚未進行程式碼簽章。首次啟動時，macOS 可能提示應用程式「已損毀，無法開啟」。最可靠的修復方式是在終端機執行以下指令，然後正常開啟應用程式：
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 另外，在攔截啟動後約 1 小時內，macOS 的「系統設定 → 隱私權與安全性」中會出現**仍要開啟**按鈕。若未看到該按鈕，請改用上方的終端機指令。

---

## 資料儲存

所有持久化資料均儲存在本地，不會上傳至任何伺服器。

| 平台 | 設定檔 | 備份 |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## 解除安裝

- **macOS：** 從 Applications 資料夾刪除應用程式。本地資料夾（包含設定檔和所有備份）**不會自動刪除** — 如需完全清除，請手動刪除：`~/Library/Application Support/eve-settings-manager`
- **Windows：** 刪除 `.exe` 檔案。如需完全清除，也請刪除資料夾（包含設定檔和所有備份）：`%APPDATA%\eve-settings-manager`

---

## 從原始碼建置

**前置條件：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 啟動開發伺服器 + Electron（熱重載）
```

```bash
pnpm build      # 型別檢查、打包並透過 electron-builder 產生安裝檔
```

輸出路徑：`release/<版本號>/`

---

## 授權條款

MIT — 詳見 [LICENSE](../LICENSE)。
