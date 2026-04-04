# EVE 설정 관리자

**EVE Online 설정 관리자**는 로컬 EVE Online 설정 파일을 관리하는 데스크톱 앱입니다. 게임 클라이언트를 실행하지 않고도 캐릭터 간에 UI 레이아웃을 복사하거나, 프로필을 백업·복원하거나, 각 계정에 메모를 추가할 수 있습니다.

**언어:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 시작하기

1. [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest) 페이지로 이동합니다.
2. 플랫폼에 맞는 파일을 다운로드합니다:
   - **macOS:** `.dmg` — 열어서 앱을 Applications 폴더로 드래그
   - **Windows:** `.exe` — 바로 실행, 설치 불필요
   - **Linux:** `.AppImage` — 실행 권한 부여 후 실행

> **macOS 참고 사항:** 앱은 아직 코드 서명되지 않았습니다. 처음 실행 시 macOS가 "손상되어 열 수 없습니다"라는 메시지를 표시할 수 있습니다. 가장 확실한 해결 방법은 터미널에서 다음 명령을 실행한 후 앱을 정상적으로 여는 것입니다:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 또는 차단된 실행 후 약 1시간 이내에 macOS의 시스템 설정 → 개인 정보 보호 및 보안에서 **그래도 열기** 버튼이 표시됩니다. 해당 버튼이 보이지 않으면 위의 터미널 명령을 사용하세요.

---

## 데이터 저장 위치

모든 영속 데이터는 로컬에 저장되며, 어떠한 서버에도 전송되지 않습니다.

| 플랫폼 | 로컬 데이터 |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## 삭제 방법

- **macOS:** Applications 폴더에서 앱을 삭제합니다. 로컬 데이터 폴더는 **자동으로 제거되지 않습니다** — 필요하면 직접 삭제하세요: `~/Library/Application Support/eve-settings-manager`
- **Windows:** `.exe` 파일을 삭제합니다. 완전히 제거하려면 데이터 폴더도 삭제하세요: `%APPDATA%\eve-settings-manager`
- **Linux:** `.AppImage` 파일을 삭제합니다. 완전히 제거하려면 데이터 폴더도 삭제하세요: `~/.config/eve-settings-manager`

---

## 소스에서 빌드

**사전 조건:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 개발 서버 + Electron 실행 (핫 리로드)
pnpm build      # 타입 검사, 번들링, electron-builder로 패키지 생성
```

---

## 면책 조항

EVE Online® 및 관련 이름, 로고, 자산은 CCP Games의 재산입니다.

---

## 라이선스

MIT — 자세한 내용은 [LICENSE](../LICENSE)를 참조하세요.
