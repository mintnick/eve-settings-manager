# EVE 設定管理器

**EVE Online 設定管理器**是一款桌面應用程式，用於管理本地 EVE Online 設定檔案——在角色之間複製介面配置、備份和還原設定資料夾、為帳號新增備註，無需啟動遊戲用戶端。

**語言:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 快速開始

1. 前往 [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest) 頁面。
2. 下載適合你平台的檔案：
   - **macOS：** `.dmg` — 開啟後將應用程式拖曳至 Applications 資料夾
   - **Windows：** `.exe` — 直接執行，無需安裝
   - **Linux：** `.AppImage` — 賦予執行權限後執行

> **macOS 注意：** 本應用程式尚未進行程式碼簽章。首次啟動時，macOS 可能提示應用程式「已損毀，無法開啟」。最可靠的修復方式是在終端機執行以下指令，然後正常開啟應用程式：
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 另外，在攔截啟動後約 1 小時內，macOS 的「系統設定 → 隱私權與安全性」中會出現**仍要開啟**按鈕。若未看到該按鈕，請改用上方的終端機指令。

---

## 資料儲存

所有持久化資料均儲存在本地，不會上傳至任何伺服器。

| 平台 | 本地資料 |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## 解除安裝

- **macOS：** 從 Applications 資料夾刪除應用程式。本地資料夾**不會自動刪除** — 如需完全清除，請手動刪除：`~/Library/Application Support/eve-settings-manager`
- **Windows：** 刪除 `.exe` 檔案。如需完全清除，也請刪除資料夾：`%APPDATA%\eve-settings-manager`
- **Linux：** 刪除 `.AppImage` 檔案。如需完全清除，也請刪除資料夾：`~/.config/eve-settings-manager`

---

## 從原始碼建置

**前置條件：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 啟動開發伺服器 + Electron（熱重載）
pnpm build      # 型別檢查、打包並透過 electron-builder 產生安裝檔
```

---

## 免責聲明

EVE Online 及其相關標誌、名稱和資產均為 CCP hf 的財產。本專案與 CCP hf 無關聯，亦未獲得其認可。

---

## 授權條款

MIT — 詳見 [LICENSE](../LICENSE)。
