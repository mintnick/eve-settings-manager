# EVE 設定マネージャー

**EVE Online 設定マネージャー**は、ローカルの EVE Online 設定ファイルを管理するデスクトップアプリです。ゲームクライアントを起動せずに、キャラクター間で UI レイアウトをコピーしたり、プロファイルのバックアップ・復元を行ったり、各アカウントにメモを付けたりできます。

**言語:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [Polski](README.pl.md)

---

## はじめに

1. [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest) ページを開きます。
2. お使いの環境に合ったファイルをダウンロードします：
   - **macOS：** `.dmg` — 開いてアプリを Applications フォルダにドラッグ
   - **Windows：** `.exe` — そのまま実行するだけ、インストール不要
   - **Linux：** `.AppImage` — 実行権限を付与して起動

> **macOS に関する注意：** アプリはまだコード署名されていません。初回起動時に macOS が「壊れているため開けません」と表示することがあります。最も確実な対処法は、ターミナルで以下のコマンドを実行した後、通常通りアプリを開くことです：
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> また、起動がブロックされてから約 1 時間以内であれば、macOS の「システム設定 → プライバシーとセキュリティ」に**このまま開く**ボタンが表示されます。ボタンが表示されない場合は、上記のターミナルコマンドをご利用ください。

---

## データの保存場所

すべての永続データはローカルに保存され、外部サーバーには一切送信されません。

| プラットフォーム | ローカルデータ |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## アンインストール

- **macOS：** Applications フォルダからアプリを削除します。ローカルデータフォルダは**自動的に削除されません** — 必要に応じて手動で削除してください：`~/Library/Application Support/eve-settings-manager`
- **Windows：** `.exe` ファイルを削除します。完全に削除するにはデータフォルダも削除してください：`%APPDATA%\eve-settings-manager`
- **Linux：** `.AppImage` ファイルを削除します。完全に削除するにはデータフォルダも削除してください：`~/.config/eve-settings-manager`

---

## ソースからビルド

**必要環境：** Node.js 18+、pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 開発サーバー + Electron を起動（ホットリロード）
pnpm build      # 型チェック・バンドル・electron-builder によるパッケージ化
```

---

## 免責事項

EVE Online® および関連するすべての名称、ロゴ、アセットは CCP Games の財産です。

---

## ライセンス

MIT — 詳細は [LICENSE](../LICENSE) を参照してください。
