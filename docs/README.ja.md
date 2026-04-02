# EVE 設定マネージャー

**EVE Online 設定マネージャー**は、ローカルの EVE Online 設定ファイルを管理するデスクトップアプリです。ゲームクライアントを起動せずに、キャラクター間で UI レイアウトをコピーしたり、プロファイルのバックアップ・復元を行ったり、各アカウントにメモを付けたりできます。

**言語:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md)

---

## 機能

- **サーバー切替** — Tranquility・Serenity・Singularity・Infinity・Thunderdome に対応。EVE インストールフォルダから自動検出
- **プロファイルフォルダ管理** — 設定プロファイル（`settings_*` サブフォルダ）の作成・名前変更・複製・削除
- **キャラクター一覧** — ESI API によるキャラクター名の自動解決と最終更新日時を表示
- **アカウント一覧** — 全アカウントファイルを表示。用途を記録するためのメモを各アカウントに追加可能
- **設定の同期** — 1 つのキャラクターまたはアカウントの UI レイアウトをワンクリックで複数の対象にコピー
- **ファイルバックアップ** — 単一のキャラクター・アカウントファイルをバックアップし、ワンクリックで復元
- **フォルダバックアップ** — プロファイル全体の名前付きスナップショットを作成。サイドバーから復元・削除が可能
- **ダーク / ライトテーマ** — デフォルトはダーク。設定はセッション間で保持
- **8 言語対応** — English・简体中文・繁體中文・日本語・한국어・Français・Deutsch・Español

---

## 技術スタック

| レイヤー | ライブラリ |
|---|---|
| デスクトップシェル | Electron 29 |
| UI フレームワーク | Vue 3 + TypeScript |
| コンポーネントライブラリ | Element Plus |
| 状態管理 | Pinia |
| 国際化 | vue-i18n |
| ビルドツール | Vite + vite-plugin-electron |
| 永続化 | electron-store |

---

## はじめに

1. [Releases](https://github.com/mintnick/eve-settings-manager/releases) ページを開きます。
2. お使いの環境に合ったファイルをダウンロードします：
   - **macOS：** `.dmg` — 開いてアプリを Applications フォルダにドラッグ
   - **Windows：** `.exe` — そのまま実行するだけ、インストール不要

---

## データの保存場所

すべての永続データ（メモ・テーマ設定・言語・サーバー記憶・キャラクター名キャッシュ）はローカルの JSON ファイルに保存され、外部サーバーには一切送信されません。

| プラットフォーム | パス |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## アンインストール

- **macOS：** Applications フォルダからアプリを削除します。ローカルデータフォルダは**自動的に削除されません** — 必要に応じて手動で削除してください：`~/Library/Application Support/eve-settings-manager`
- **Windows：** `.exe` ファイルを削除します。完全に削除するにはデータフォルダも削除してください：`%APPDATA%\eve-settings-manager`

---

## ソースからビルド

**必要環境：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 開発サーバー + Electron を起動（ホットリロード）
```

```bash
pnpm build      # 型チェック・バンドル・electron-builder によるパッケージ化
```

出力先：`release/<バージョン>/`

---

## ライセンス

MIT — 詳細は [LICENSE](../LICENSE) を参照してください。
