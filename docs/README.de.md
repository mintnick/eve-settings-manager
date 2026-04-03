# EVE Settings Manager

**EVE Online Settings Manager** ist eine Desktop-Anwendung zur Verwaltung lokaler EVE Online-Einstellungsdateien — kopieren Sie UI-Layouts zwischen Charakteren, sichern und stellen Sie Profile wieder her und hinterlassen Sie Notizen zu jedem Konto, ohne den Spielclient zu starten.

**Sprachen:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Español](README.es.md)

---

## Funktionen

- **Server-Wechsel** — Tranquility, Serenity, Singularity, Infinity, Thunderdome; automatische Erkennung aus dem EVE-Installationsordner
- **Profilverwaltung** — Erstellen, Umbenennen, Duplizieren und Löschen von Einstellungsprofilen (die von EVE verwendeten `settings_*`-Unterordner)
- **Charakterliste** — zeigt alle Charakterdateien mit über die ESI-API aufgelösten Namen und Änderungszeitstempeln
- **Kontoliste** — zeigt alle Kontodateien; fügen Sie jedem Konto eine persönliche Notiz hinzu, um dessen Verwendungszweck festzuhalten
- **Einstellungen synchronisieren** — kopieren Sie das UI-Layout eines Charakters oder Kontos mit einem Klick auf beliebig viele andere
- **Datei-Sicherung** — sichern Sie eine einzelne Charakter- oder Kontodatei; stellen Sie sie mit einem Klick wieder her
- **Ordner-Sicherung** — erstellen Sie einen benannten Schnappschuss des gesamten Profils; stellen Sie ihn wieder her oder löschen Sie ihn über die Seitenleiste
- **Dunkel- / Hellmodus** — standardmäßig dunkel; Einstellung wird sitzungsübergreifend gespeichert
- **8 Sprachen** — English, 简体中文, 繁體中文, 日本語, 한국어, Français, Deutsch, Español

---

## Tech-Stack

| Schicht | Bibliothek |
|---|---|
| Desktop-Shell | Electron 41 |
| UI-Framework | Vue 3 + TypeScript |
| Komponentenbibliothek | Element Plus |
| Zustandsverwaltung | Pinia |
| Internationalisierung | vue-i18n |
| Build-Tool | Vite + vite-plugin-electron |
| Persistenz | electron-store |

---

## Erste Schritte

1. Gehe zur [Releases](https://github.com/mintnick/eve-settings-manager/releases)-Seite.
2. Lade die passende Datei für dein Betriebssystem herunter:
   - **macOS:** `.dmg` — öffnen und die App in den Programme-Ordner ziehen
   - **Windows:** `.exe` — direkt ausführen, keine Installation nötig

---

## Datenspeicherung

Alle persistenten Daten (Notizen, Theme-Einstellung, Sprache, Server-Gedächtnis, Charakternamen-Cache) werden lokal in einer JSON-Datei gespeichert — nichts wird an externe Server übertragen.

| Plattform | Pfad |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## Deinstallation

- **macOS:** App aus dem Programme-Ordner löschen. Der lokale Datenordner wird **nicht automatisch gelöscht** — bei Bedarf manuell entfernen: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Die `.exe`-Datei löschen. Für eine vollständige Deinstallation auch den Datenordner entfernen: `%APPDATA%\eve-settings-manager`

---

## Aus dem Quellcode bauen

**Voraussetzungen:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # Entwicklungsserver + Electron starten (Hot Reload)
```

```bash
pnpm build      # Typprüfung, Bundling und Paketierung mit electron-builder
```

Die Ausgabe wird in `release/<Version>/` geschrieben.

---

## Lizenz

MIT — siehe [LICENSE](../LICENSE).
