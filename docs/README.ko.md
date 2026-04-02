# EVE 설정 관리자

**EVE Online 설정 관리자**는 로컬 EVE Online 설정 파일을 관리하는 데스크톱 앱입니다. 게임 클라이언트를 실행하지 않고도 캐릭터 간에 UI 레이아웃을 복사하거나, 프로필을 백업·복원하거나, 각 계정에 메모를 추가할 수 있습니다.

**언어:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md)

---

## 기능

- **서버 전환** — Tranquility, Serenity, Singularity, Infinity, Thunderdome 지원; EVE 설치 폴더에서 자동 감지
- **프로필 폴더 관리** — 설정 프로필(`settings_*` 하위 폴더) 생성, 이름 변경, 복제, 삭제
- **캐릭터 목록** — ESI API로 자동 해석된 캐릭터 이름과 마지막 수정 시간 표시
- **계정 목록** — 모든 계정 파일 표시; 각 계정에 용도를 기록하는 메모 추가 가능
- **설정 동기화** — 한 캐릭터 또는 계정의 UI 레이아웃을 클릭 한 번으로 여러 대상에 복사
- **파일 백업** — 단일 캐릭터·계정 파일 백업 및 원클릭 복원
- **폴더 백업** — 프로필 전체의 이름 있는 스냅샷 생성; 사이드바에서 복원 및 삭제
- **다크 / 라이트 테마** — 기본값은 다크; 설정이 세션 간 유지
- **8개 언어** — English, 简体中文, 繁體中文, 日本語, 한국어, Français, Deutsch, Español

---

## 기술 스택

| 계층 | 라이브러리 |
|---|---|
| 데스크톱 셸 | Electron 29 |
| UI 프레임워크 | Vue 3 + TypeScript |
| 컴포넌트 라이브러리 | Element Plus |
| 상태 관리 | Pinia |
| 국제화 | vue-i18n |
| 빌드 도구 | Vite + vite-plugin-electron |
| 영속성 | electron-store |

---

## 시작하기

**사전 조건:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # 개발 서버 + Electron 실행 (핫 리로드)
```

### 빌드

```bash
pnpm build      # 타입 검사, 번들링, electron-builder로 패키지 생성
```

출력 경로: `release/<버전>/`

---

## 데이터 저장 위치

모든 영속 데이터(메모, 테마 설정, 언어, 서버 기억, 캐릭터 이름 캐시)는 로컬 JSON 파일에 저장되며, 어떠한 서버에도 전송되지 않습니다.

| 플랫폼 | 경로 |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## 삭제 방법

앱을 삭제해도 로컬 데이터 폴더는 **자동으로 제거되지 않습니다**. 완전히 삭제하려면 앱을 제거한 후 아래 데이터 폴더를 직접 삭제하세요.

- **macOS:** `~/Library/Application Support/eve-settings-manager`
- **Windows:** `%APPDATA%\eve-settings-manager`

---

## 라이선스

MIT — 자세한 내용은 [LICENSE](../LICENSE)를 참조하세요.
