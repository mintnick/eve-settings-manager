# EVE Settings Manager

**EVE Online Settings Manager** to aplikacja desktopowa do zarządzania lokalnymi plikami ustawień EVE Online — kopiuj układy interfejsu między postaciami, twórz kopie zapasowe i przywracaj profile, dodawaj notatki do kont, bez uruchamiania klienta gry.

**Języki:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

---

## Pierwsze kroki

1. Przejdź na stronę [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest).
2. Pobierz plik dla swojej platformy:
   - **macOS:** `.dmg` — otwórz i przeciągnij aplikację do folderu Aplikacje
   - **Windows:** `.exe` — uruchom bezpośrednio, instalacja nie jest wymagana
   - **Linux:** `.AppImage` — nadaj uprawnienia do wykonania i uruchom

> **Uwaga dla macOS:** Aplikacja nie jest jeszcze podpisana kodem. Przy pierwszym uruchomieniu macOS może poinformować, że jest „uszkodzona i nie można jej otworzyć". Najbardziej niezawodnym rozwiązaniem jest wykonanie poniższego polecenia w Terminalu, a następnie normalne otwarcie aplikacji:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternatywnie, macOS wyświetla przycisk **Otwórz mimo to** w Ustawieniach systemowych → Prywatność i bezpieczeństwo przez około 1 godzinę po zablokowanym uruchomieniu. Jeśli przycisk nie jest widoczny, użyj powyższego polecenia Terminal.

---

## Przechowywanie danych

Wszystkie trwałe dane są przechowywane lokalnie — nic nie jest wysyłane na zewnętrzne serwery.

| Platforma | Lokalne dane |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## Odinstalowanie

- **macOS:** Usuń aplikację z folderu Aplikacje. Lokalny folder danych **nie jest usuwany automatycznie** — usuń go ręcznie, jeśli chcesz: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Usuń plik `.exe`. Aby usunąć wszystko, usuń również folder danych: `%APPDATA%\eve-settings-manager`
- **Linux:** Usuń plik `.AppImage`. Aby usunąć wszystko, usuń również folder danych: `~/.config/eve-settings-manager`

---

## Budowanie ze źródeł

**Wymagania:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # uruchom serwer deweloperski + Electron (hot reload)
pnpm build      # sprawdzanie typów, bundling i pakowanie z electron-builder
```

---

## Zastrzeżenie

EVE Online® oraz wszystkie powiązane nazwy, logotypy i zasoby są własnością CCP Games.

---

## Licencja

MIT — zobacz [LICENSE](../LICENSE).
