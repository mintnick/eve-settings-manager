# EVE 設定管理器

**EVE Online 設定管理器**是一款桌面應用程式，用於管理本地 EVE Online 設定檔案——在角色之間複製介面配置、備份和還原設定資料夾、為帳號新增備註，無需啟動遊戲用戶端。

**語言:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 下載安裝

1. 前往 [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest) 頁面。
2. 下載適合你系統的檔案：
   - **macOS：** `.dmg` — 開啟後將應用程式拖曳至 Applications 資料夾
   - **Windows：** `.exe` — 直接執行，無需安裝
   - **Linux：** `.AppImage` — 賦予執行權限後執行

> **macOS 注意：** 本應用程式尚未進行程式碼簽署。首次開啟時，macOS 可能提示「已損毀，無法開啟」。最可靠的解決方式是在終端機執行以下指令，然後正常開啟應用程式：
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 另外，在首次被拒絕後約 1 小時內，macOS 的「系統設定 → 隱私權與安全性」中會出現**仍要開啟**按鈕。如果沒有看到該按鈕，請使用上方的終端機指令。

---

## 選擇設定資料夾

應用程式啟動時會自動尋找 EVE 設定資料夾。若未能自動找到，或需要指定其他路徑，請點擊**手動選擇設定資料夾**按鈕。

**預設路徑：**

| 平台 | 預設路徑 |
|---|---|
| macOS | `~/Library/Application Support/CCP/EVE` |
| Windows | `%LOCALAPPDATA%\CCP\EVE` |
| Linux | 視 Wine / Proton 前置目錄而定 |

**可能無法自動找到的原因：**

- EVE 安裝於非標準目錄
- 在 Linux/macOS 上使用自訂啟動器、Wine 或 Proton
- 安裝了多個 EVE 用戶端或地區伺服器用戶端（如晨曦/曙光）

**資料夾結構：**

該資料夾應包含一個或多個以伺服器命名的子資料夾（如 `c_tranquility`、`_tq_tranquility`、`c_serenity`），每個伺服器資料夾內包含配置資料夾（`settings_Default`、`settings_Custom` 等），配置資料夾內存放 `.dat` 設定檔案。

```
CCP/EVE/
├── c_tranquility/
│   ├── settings_Default/
│   │   ├── core_char_12345678.dat
│   │   └── core_user_12345678.dat
│   └── settings_Custom/
└── c_serenity/
    └── settings_Default/
```

**提示：** 可選擇頂層遊戲資料夾（如 `CCP/EVE`），或直接進入某個伺服器子資料夾（如 `c_tranquility`），應用程式將自動識別。

---

## 資料儲存

所有資料均儲存在本地，不會發送至任何伺服器。

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

**環境要求：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 啟動開發伺服器 + Electron（支援熱重載）
pnpm build      # 型別檢查、建置並打包
```

---

## 免責聲明

EVE Online® 及其相關名稱、標誌和資產均為 CCP Games 的財產。

---

## 授權條款

MIT — 詳見 [LICENSE](../LICENSE)。
