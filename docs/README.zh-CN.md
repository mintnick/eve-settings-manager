# EVE 设置管理器

**EVE Online 设置管理器**是一款桌面应用，用于管理本地 EVE Online 设置文件——在角色之间复制界面布局、备份和还原配置文件夹、为账户添加备注，无需启动游戏客户端。

**语言:**
[English](../README.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 快速开始

1. 前往 [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest) 页面。
2. 下载适合你平台的文件：
   - **macOS：** `.dmg` — 打开后将应用拖入 Applications 文件夹
   - **Windows：** `.exe` — 直接运行，无需安装
   - **Linux：** `.AppImage` — 授予执行权限后运行

> **macOS 注意：** 本应用尚未代码签名。首次启动时，macOS 可能提示应用"已损坏，无法打开"。最可靠的修复方法是在终端中运行以下命令，然后正常打开应用：
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 另外，在拦截启动后约 1 小时内，macOS 的"系统设置 → 隐私与安全性"中会出现**仍要打开**按钮。若未见该按钮，请使用上面的终端命令。

---

## 数据存储

所有持久化数据均存储在本地，不会上传至任何服务器。

| 平台 | 本地数据 |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## 卸载

- **macOS：** 从 Applications 文件夹删除应用。本地数据文件夹**不会自动删除** — 如需彻底清除，请手动删除：`~/Library/Application Support/eve-settings-manager`
- **Windows：** 删除 `.exe` 文件。如需彻底清除，也请删除数据文件夹：`%APPDATA%\eve-settings-manager`
- **Linux：** 删除 `.AppImage` 文件。如需彻底清除，也请删除数据文件夹：`~/.config/eve-settings-manager`

---

## 从源码构建

**前置条件：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 启动开发服务器 + Electron（热重载）
pnpm build      # 类型检查、打包并通过 electron-builder 生成安装包
```

---

## 免责声明

EVE Online 及其相关标志、名称和资产均为 CCP hf 的财产。本项目与 CCP hf 无关联，亦未获得其认可。

---

## 许可证

MIT — 详见 [LICENSE](../LICENSE)。
