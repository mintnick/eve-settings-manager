# EVE 设置管理器

**EVE Online 设置管理器**是一款桌面应用，用于管理本地 EVE Online 设置文件——在角色之间复制界面布局、备份和还原配置文件夹、为账户添加备注，无需启动游戏客户端。

**语言:**
[English](../README.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 功能

- **服务器切换** — 支持 Tranquility、Serenity、Singularity、Infinity、Thunderdome，从 EVE 安装目录自动检测
- **配置文件夹管理** — 创建、重命名、复制、删除配置文件夹（即 EVE 使用的 `settings_*` 子目录）
- **角色列表** — 显示所有角色文件，通过 ESI API 自动解析角色名称和最后修改时间
- **账户列表** — 显示所有账户文件；可为每个账户添加备注，方便记录用途
- **同步设置** — 一键将某个角色或账户的界面布局复制到任意多个其他角色/账户
- **单文件备份** — 备份单个角色或账户文件，一键还原
- **文件夹备份** — 为整个配置文件夹创建命名快照，从侧边栏进行还原或删除
- **深色 / 浅色主题** — 默认深色，首次启动时跟随系统主题；偏好设置跨会话保存
- **11 种语言** — English、简体中文、繁體中文、Русский、Deutsch、Français、Español、Português (BR)、한국어、日本語、Polski

---

## 技术栈

| 层级 | 库 |
|---|---|
| 桌面外壳 | Electron 41 |
| UI 框架 | Vue 3 + TypeScript |
| 组件库 | Element Plus |
| 状态管理 | Pinia |
| 国际化 | vue-i18n |
| 构建工具 | Vite + vite-plugin-electron |
| 持久化 | electron-store |

---

## 快速开始

1. 前往 [Releases](https://github.com/mintnick/eve-settings-manager/releases) 页面。
2. 下载适合你平台的文件：
   - **macOS：** `.dmg` — 打开后将应用拖入 Applications 文件夹
   - **Windows：** `.exe` — 直接运行，无需安装

> **macOS 注意：** 本应用尚未代码签名。首次启动时，macOS 可能提示应用"已损坏，无法打开"。最可靠的修复方法是在终端中运行以下命令，然后正常打开应用：
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 另外，在拦截启动后约 1 小时内，macOS 的"系统设置 → 隐私与安全性"中会出现**仍要打开**按钮。若未见该按钮，请使用上面的终端命令。

---

## 数据存储

所有持久化数据均存储在本地，不会上传至任何服务器。

| 平台 | 配置文件 | 备份 |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## 卸载

- **macOS：** 从 Applications 文件夹删除应用。本地数据文件夹（包含配置文件和所有备份）**不会自动删除** — 如需彻底清除，请手动删除：`~/Library/Application Support/eve-settings-manager`
- **Windows：** 删除 `.exe` 文件。如需彻底清除，也请删除数据文件夹（包含配置文件和所有备份）：`%APPDATA%\eve-settings-manager`

---

## 从源码构建

**前置条件：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 启动开发服务器 + Electron（热重载）
```

```bash
pnpm build      # 类型检查、打包并通过 electron-builder 生成安装包
```

输出路径：`release/<版本号>/`

---

## 许可证

MIT — 详见 [LICENSE](../LICENSE)。
