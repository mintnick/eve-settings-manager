# EVE Settings Manager

**EVE Online Settings Manager** ist eine Desktop-Anwendung zur Verwaltung lokaler EVE Online-Einstellungsdateien — kopieren Sie UI-Layouts zwischen Charakteren, sichern und stellen Sie Profile wieder her und hinterlassen Sie Notizen zu jedem Konto, ohne den Spielclient zu starten.

**Sprachen:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Erste Schritte

1. Gehe zur [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest)-Seite.
2. Lade die passende Datei für dein Betriebssystem herunter:
   - **macOS:** `.dmg` — öffnen und die App in den Programme-Ordner ziehen
   - **Windows:** `.exe` — direkt ausführen, keine Installation nötig
   - **Linux:** `.AppImage` — ausführbar machen und starten

> **macOS-Hinweis:** Die App ist noch nicht code-signiert. Beim ersten Start meldet macOS möglicherweise, die App sei „beschädigt und kann nicht geöffnet werden". Die zuverlässigste Lösung ist, folgenden Befehl im Terminal auszuführen und die App danach normal zu öffnen:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternativ erscheint in macOS unter Systemeinstellungen → Datenschutz & Sicherheit kurz nach dem blockierten Start (~1 Stunde) ein Button **Trotzdem öffnen**. Falls dieser Button nicht erscheint, bitte den Terminal-Befehl oben verwenden.

---

## Einstellungsordner auswählen

Die App sucht beim Start automatisch nach dem EVE-Einstellungsordner. Falls er nicht gefunden wird oder ein anderer Pfad benötigt wird, klicken Sie auf **Einstellungsordner manuell auswählen**.

**Standardpfade:**

| Plattform | Standardpfad |
|---|---|
| macOS | `~/Library/Application Support/CCP/EVE` |
| Windows | `%LOCALAPPDATA%\CCP\EVE` |
| Linux | abhängig vom Wine-/Proton-Präfix |

**Mögliche Ursachen, warum der Ordner nicht automatisch gefunden wird:**

- EVE ist in einem nicht standardmäßigen Verzeichnis installiert
- Ein benutzerdefinierter Launcher, Wine oder Proton wird unter Linux/macOS verwendet
- Mehrere EVE-Installationen oder regionale Clients (z. B. Serenity/Infinity) sind vorhanden

**Ordnerstruktur:**

Der Ordner sollte einen oder mehrere Unterordner mit Servernamen enthalten (z. B. `c_tranquility`, `_tq_tranquility`, `c_serenity`). In jedem Serverordner befinden sich Profilordner (`settings_Default`, `settings_Custom` usw.), die wiederum die `.dat`-Einstellungsdateien enthalten.

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

**Tipp:** Es kann entweder der übergeordnete Spielordner (z. B. `CCP/EVE`) oder direkt ein Server-Unterordner (z. B. `c_tranquility`) ausgewählt werden — die App erkennt den Rest automatisch.

---

## Datenspeicherung

Alle persistenten Daten werden lokal gespeichert — nichts wird an externe Server übertragen.

| Plattform | Lokale Daten |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## Deinstallation

- **macOS:** App aus dem Programme-Ordner löschen. Der lokale Datenordner wird **nicht automatisch gelöscht** — bei Bedarf manuell entfernen: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Die `.exe`-Datei löschen. Für eine vollständige Deinstallation auch den Datenordner entfernen: `%APPDATA%\eve-settings-manager`
- **Linux:** Die `.AppImage`-Datei löschen. Für eine vollständige Deinstallation auch den Datenordner entfernen: `~/.config/eve-settings-manager`

---

## Aus dem Quellcode bauen

**Voraussetzungen:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # Entwicklungsserver + Electron starten (Hot Reload)
pnpm build      # Typprüfung, Bundling und Paketierung mit electron-builder
```

---

## Haftungsausschluss

EVE Online® sowie alle zugehörigen Namen, Logos und Assets sind Eigentum von CCP Games.

---

## Lizenz

MIT — siehe [LICENSE](../LICENSE).
