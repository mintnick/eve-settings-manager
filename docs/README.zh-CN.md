# EVE 设置管理器

**EVE Online 设置管理器**是一款桌面应用，用于管理本地 EVE Online 设置文件——在角色之间复制界面布局、备份和还原配置文件夹、为账户添加备注，无需启动游戏客户端。

**语言:**
[English](../README.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 下载安装

1. 前往 [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest) 页面。
2. 下载适合你系统的文件：
   - **macOS：** `.dmg` — 打开后将应用拖入 Applications 文件夹
   - **Windows：** `.exe` — 直接运行，无需安装
   - **Linux：** `.AppImage` — 赋予执行权限后运行

> **macOS 注意：** 本应用尚未进行代码签名。首次打开时，macOS 可能提示"已损坏，无法打开"。最可靠的解决方法是在终端运行以下命令，然后正常打开应用：
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 另外，在首次被拦截后约 1 小时内，macOS 的"系统设置 → 隐私与安全性"中会出现**仍要打开**按钮。如果没有看到该按钮，请使用上方的终端命令。

---

## 数据存储

所有数据均保存在本地，不会发送至任何服务器。

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

**环境要求：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 启动开发服务器 + Electron（支持热重载）
pnpm build      # 类型检查、构建并打包
```

---

## 免责声明

EVE Online® 及其相关名称、标志和资产均为 CCP Games 的财产。本项目与 CCP Games 没有任何关联，也未获得其授权或认可。

---

## 许可证

MIT — 详见 [LICENSE](../LICENSE)。
