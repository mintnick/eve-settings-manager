# EVE Settings Manager

**EVE Online Settings Manager** to aplikacja desktopowa do zarządzania lokalnymi plikami ustawień EVE Online — kopiuj układy interfejsu między postaciami, twórz kopie zapasowe i przywracaj profile, dodawaj notatki do kont, bez uruchamiania klienta gry.

**Języki:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

---

## Funkcje

- **Przełączanie serwerów** — Tranquility, Serenity, Singularity, Infinity, Thunderdome; automatyczne wykrywanie z folderu instalacji EVE
- **Zarządzanie profilami** — tworzenie, zmiana nazwy, duplikowanie i usuwanie profili ustawień (podkatalogi `settings_*` używane przez EVE)
- **Lista postaci** — wyświetla wszystkie pliki postaci z nazwami rozwiązanymi przez API ESI i znacznikami czasu modyfikacji
- **Lista kont** — wyświetla wszystkie pliki kont; dodaj osobistą notatkę do każdego konta, aby zapamiętać jego przeznaczenie
- **Synchronizacja ustawień** — skopiuj układ interfejsu jednej postaci lub konta do wielu innych jednym kliknięciem
- **Kopia zapasowa pliku** — zapisz pojedynczy plik postaci lub konta; przywróć jednym kliknięciem
- **Kopia zapasowa folderu** — utwórz nazwany migawkę całego profilu; przywróć lub usuń z paska bocznego
- **Motyw ciemny / jasny** — domyślnie ciemny; przy pierwszym uruchomieniu podąża za motywem systemowym; preferencja zapisywana między sesjami
- **11 języków** — English, 简体中文, 繁體中文, Русский, Deutsch, Français, Español, Português (BR), 한국어, 日本語, Polski

---

## Stos technologiczny

| Warstwa | Biblioteka |
|---|---|
| Powłoka desktop | Electron 41 |
| Framework UI | Vue 3 + TypeScript |
| Biblioteka komponentów | Element Plus |
| Zarządzanie stanem | Pinia |
| Internacjonalizacja | vue-i18n |
| Narzędzie build | Vite + vite-plugin-electron |
| Trwałość | electron-store |

---

## Pierwsze kroki

1. Przejdź na stronę [Releases](https://github.com/mintnick/eve-settings-manager/releases).
2. Pobierz plik dla swojej platformy:
   - **macOS:** `.dmg` — otwórz i przeciągnij aplikację do folderu Aplikacje
   - **Windows:** `.exe` — uruchom bezpośrednio, instalacja nie jest wymagana

> **Uwaga dla macOS:** Aplikacja nie jest jeszcze podpisana kodem. Przy pierwszym uruchomieniu macOS może poinformować, że jest „uszkodzona i nie można jej otworzyć". Najbardziej niezawodnym rozwiązaniem jest wykonanie poniższego polecenia w Terminalu, a następnie normalne otwarcie aplikacji:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternatywnie, macOS wyświetla przycisk **Otwórz mimo to** w Ustawieniach systemowych → Prywatność i bezpieczeństwo przez około 1 godzinę po zablokowanym uruchomieniu. Jeśli przycisk nie jest widoczny, użyj powyższego polecenia Terminal.

---

## Przechowywanie danych

Wszystkie trwałe dane są przechowywane lokalnie — nic nie jest wysyłane na zewnętrzne serwery.

| Platforma | Konfiguracja | Kopie zapasowe |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## Odinstalowanie

- **macOS:** Usuń aplikację z folderu Aplikacje. Lokalny folder danych (zawierający konfigurację i wszystkie kopie zapasowe) **nie jest usuwany automatycznie** — usuń go ręcznie, jeśli chcesz: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Usuń plik `.exe`. Aby usunąć wszystko, usuń również folder danych (zawierający konfigurację i wszystkie kopie zapasowe): `%APPDATA%\eve-settings-manager`

---

## Budowanie ze źródeł

**Wymagania:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # uruchom serwer deweloperski + Electron (hot reload)
```

```bash
pnpm build      # sprawdzanie typów, bundling i pakowanie z electron-builder
```

Wynik jest zapisywany do `release/<wersja>/`.

---

## Licencja

MIT — zobacz [LICENSE](../LICENSE).
