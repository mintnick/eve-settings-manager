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

## Wybór folderu ustawień

Przy uruchomieniu aplikacja automatycznie szuka folderu ustawień EVE. Jeśli nie zostanie znaleziony lub chcesz wskazać inne miejsce, kliknij **Ręcznie wybierz folder ustawień**.

**Domyślne lokalizacje:**

| Platforma | Domyślna ścieżka |
|---|---|
| macOS | `~/Library/Application Support/CCP/EVE` |
| Windows | `%LOCALAPPDATA%\CCP\EVE` |
| Linux | zależy od prefiksu Wine / Proton |

**Możliwe przyczyny braku automatycznego wykrycia:**

- EVE zainstalowane w niestandardowym katalogu
- Używasz własnego launchera, Wine lub Proton na Linux/macOS
- Masz kilka instalacji EVE lub klientów regionalnych (np. Serenity/Infinity)

**Struktura folderu:**

Folder powinien zawierać jeden lub więcej podfolderów o nazwach serwerów (np. `c_tranquility`, `_tq_tranquility`, `c_serenity`). Wewnątrz każdego folderu serwera znajdują się foldery profili (`settings_Default`, `settings_Custom` itp.), a w nich pliki ustawień `.dat`.

```
CCP/EVE/
├── c_tranquility/
│   ├── settings_Default/
│   │   ├── core_char_12345678.dat
│   │   └── core_user_12345678.dat
│   └── settings_Custom/
└── c_serenity/
    └── settings_Default/
```

**Wskazówka:** Możesz wybrać główny folder gry (np. `CCP/EVE`) lub przejść bezpośrednio do podfolderu serwera (np. `c_tranquility`) — aplikacja automatycznie rozpozna resztę.

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
