# EVE 설정 관리자

**EVE Online 설정 관리자**는 로컬 EVE Online 설정 파일을 관리하는 데스크톱 앱입니다. 게임 클라이언트를 실행하지 않고도 캐릭터 간에 UI 레이아웃을 복사하거나, 프로필을 백업·복원하거나, 각 계정에 메모를 추가할 수 있습니다.

**언어:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## 기능

- **서버 전환** — Tranquility, Serenity, Singularity, Infinity, Thunderdome 지원; EVE 설치 폴더에서 자동 감지
- **프로필 폴더 관리** — 설정 프로필(`settings_*` 하위 폴더) 생성, 이름 변경, 복제, 삭제
- **캐릭터 목록** — ESI API로 자동 해석된 캐릭터 이름과 마지막 수정 시간 표시
- **계정 목록** — 모든 계정 파일 표시; 각 계정에 용도를 기록하는 메모 추가 가능
- **설정 동기화** — 한 캐릭터 또는 계정의 UI 레이아웃을 클릭 한 번으로 여러 대상에 복사
- **파일 백업** — 단일 캐릭터·계정 파일 백업 및 원클릭 복원
- **폴더 백업** — 프로필 전체의 이름 있는 스냅샷 생성; 사이드바에서 복원 및 삭제
- **다크 / 라이트 테마** — 기본값은 다크; 첫 실행 시 시스템 테마를 따름; 설정이 세션 간 유지
- **11개 언어** — English, 简体中文, 繁體中文, Русский, Deutsch, Français, Español, Português (BR), 한국어, 日本語, Polski

---

## 기술 스택

| 계층 | 라이브러리 |
|---|---|
| 데스크톱 셸 | Electron 41 |
| UI 프레임워크 | Vue 3 + TypeScript |
| 컴포넌트 라이브러리 | Element Plus |
| 상태 관리 | Pinia |
| 국제화 | vue-i18n |
| 빌드 도구 | Vite + vite-plugin-electron |
| 영속성 | electron-store |

---

## 시작하기

1. [Releases](https://github.com/mintnick/eve-settings-manager/releases) 페이지로 이동합니다.
2. 플랫폼에 맞는 파일을 다운로드합니다:
   - **macOS:** `.dmg` — 열어서 앱을 Applications 폴더로 드래그
   - **Windows:** `.exe` — 바로 실행, 설치 불필요

> **macOS 참고 사항:** 앱은 아직 코드 서명되지 않았습니다. 처음 실행 시 macOS가 "손상되어 열 수 없습니다"라는 메시지를 표시할 수 있습니다. 가장 확실한 해결 방법은 터미널에서 다음 명령을 실행한 후 앱을 정상적으로 여는 것입니다:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> 또는 차단된 실행 후 약 1시간 이내에 macOS의 시스템 설정 → 개인 정보 보호 및 보안에서 **그래도 열기** 버튼이 표시됩니다. 해당 버튼이 보이지 않으면 위의 터미널 명령을 사용하세요.

---

## 데이터 저장 위치

모든 영속 데이터는 로컬에 저장되며, 어떠한 서버에도 전송되지 않습니다.

| 플랫폼 | 설정 | 백업 |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## 삭제 방법

- **macOS:** Applications 폴더에서 앱을 삭제합니다. 로컬 데이터 폴더(설정 및 모든 백업 포함)는 **자동으로 제거되지 않습니다** — 필요하면 직접 삭제하세요: `~/Library/Application Support/eve-settings-manager`
- **Windows:** `.exe` 파일을 삭제합니다. 완전히 제거하려면 데이터 폴더(설정 및 모든 백업 포함)도 삭제하세요: `%APPDATA%\eve-settings-manager`

---

## 소스에서 빌드

**사전 조건:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 개발 서버 + Electron 실행 (핫 리로드)
```

```bash
pnpm build      # 타입 검사, 번들링, electron-builder로 패키지 생성
```

출력 경로: `release/<버전>/`

---

## 라이선스

MIT — 자세한 내용은 [LICENSE](../LICENSE)를 참조하세요.
