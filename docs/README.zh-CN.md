# EVE 设置管理器

**EVE Online 设置管理器**是一款桌面应用，用于管理本地 EVE Online 设置文件——在角色之间复制界面布局、备份和还原配置文件夹、为账户添加备注，无需启动游戏客户端。

**语言:**
[English](../README.md) · [繁體中文](README.zh-CHT.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md)

---

## 功能

- **服务器切换** — 支持 Tranquility、Serenity、Singularity、Infinity、Thunderdome，从 EVE 安装目录自动检测
- **配置文件夹管理** — 创建、重命名、复制、删除配置文件夹（即 EVE 使用的 `settings_*` 子目录）
- **角色列表** — 显示所有角色文件，通过 ESI API 自动解析角色名称和最后修改时间
- **账户列表** — 显示所有账户文件；可为每个账户添加备注，方便记录用途
- **同步设置** — 一键将某个角色或账户的界面布局复制到任意多个其他角色/账户
- **单文件备份** — 备份单个角色或账户文件，一键还原
- **文件夹备份** — 为整个配置文件夹创建命名快照，从侧边栏进行还原或删除
- **深色 / 浅色主题** — 默认深色，偏好设置跨会话保存
- **8 种语言** — English、简体中文、繁體中文、日本語、한국어、Français、Deutsch、Español

---

## 技术栈

| 层级 | 库 |
|---|---|
| 桌面外壳 | Electron 29 |
| UI 框架 | Vue 3 + TypeScript |
| 组件库 | Element Plus |
| 状态管理 | Pinia |
| 国际化 | vue-i18n |
| 构建工具 | Vite + vite-plugin-electron |
| 持久化 | electron-store |

---

## 快速开始

**前置条件：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 启动开发服务器 + Electron（热重载）
```

### 打包构建

```bash
pnpm build      # 类型检查、打包并通过 electron-builder 生成安装包
```

输出路径：`release/<版本号>/`

---

## 数据存储

所有持久化数据（备注、主题偏好、语言、服务器记忆、角色名称缓存）均存储在本地 JSON 文件中，不会上传至任何服务器。

| 平台 | 路径 |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## 卸载

卸载应用程序**不会**自动删除本地数据文件夹。如需彻底清除，请卸载应用后手动删除以下数据文件夹：

- **macOS：** `~/Library/Application Support/eve-settings-manager`
- **Windows：** `%APPDATA%\eve-settings-manager`

---

## 许可证

MIT — 详见 [LICENSE](../LICENSE)。
