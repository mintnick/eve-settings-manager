# EVE Settings Manager

**EVE Online Settings Manager** est une application de bureau pour gérer vos fichiers de paramètres EVE Online locaux — copiez des mises en page entre personnages, sauvegardez et restaurez des profils, et ajoutez des notes à chaque compte, sans lancer le client de jeu.

**Langues :**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Démarrage rapide

1. Rendez-vous sur la page [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest).
2. Téléchargez le fichier pour votre plateforme :
   - **macOS :** `.dmg` — ouvrez-le et glissez l'app dans le dossier Applications
   - **Windows :** `.exe` — lancez-le directement, aucune installation requise
   - **Linux :** `.AppImage` — rendez-le exécutable et lancez-le

> **Note macOS :** L'app n'est pas encore signée. Au premier lancement, macOS peut indiquer qu'elle est « endommagée et ne peut pas être ouverte ». La solution la plus fiable est d'exécuter la commande suivante dans le Terminal, puis d'ouvrir l'app normalement :
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternativement, macOS affiche un bouton **Ouvrir quand même** dans Réglages Système → Confidentialité & Sécurité pendant environ 1 heure après le lancement bloqué. Si ce bouton n'apparaît pas, utilisez la commande Terminal ci-dessus.

---

## Sélectionner le dossier de paramètres

Au démarrage, l'application recherche automatiquement le dossier de paramètres EVE. S'il n'est pas trouvé ou si vous souhaitez indiquer un autre emplacement, cliquez sur **Sélectionner manuellement le dossier de paramètres**.

**Emplacements par défaut :**

| Plateforme | Chemin par défaut |
|---|---|
| macOS | `~/Library/Application Support/CCP/EVE` |
| Windows | `%LOCALAPPDATA%\CCP\EVE` |
| Linux | dépend du préfixe Wine / Proton |

**Raisons pour lesquelles le dossier peut ne pas être trouvé automatiquement :**

- EVE est installé dans un répertoire non standard
- Vous utilisez un lanceur personnalisé, Wine ou Proton sous Linux/macOS
- Plusieurs installations d'EVE ou des clients régionaux sont présents (ex. : Serenity/Infinity)

**Structure du dossier :**

Le dossier doit contenir un ou plusieurs sous-dossiers nommés d'après les serveurs (ex. : `c_tranquility`, `_tq_tranquility`, `c_serenity`). Chaque dossier serveur contient des dossiers de profil (`settings_Default`, `settings_Custom`, etc.), eux-mêmes contenant les fichiers de paramètres `.dat`.

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

**Astuce :** Vous pouvez sélectionner le dossier racine du jeu (ex. : `CCP/EVE`) ou naviguer directement dans un sous-dossier serveur (ex. : `c_tranquility`) — l'application s'adapte automatiquement.

---

## Stockage des données

Toutes les données persistantes sont stockées localement — rien n'est envoyé à un serveur externe.

| Plateforme | Données locales |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## Désinstallation

- **macOS :** Supprimez l'app du dossier Applications. Le dossier de données local **n'est pas supprimé automatiquement** — effacez-le manuellement si besoin : `~/Library/Application Support/eve-settings-manager`
- **Windows :** Supprimez le fichier `.exe`. Pour tout effacer, supprimez également le dossier de données : `%APPDATA%\eve-settings-manager`
- **Linux :** Supprimez le fichier `.AppImage`. Pour tout effacer, supprimez également le dossier de données : `~/.config/eve-settings-manager`

---

## Compiler depuis les sources

**Prérequis :** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # lance le serveur de développement + Electron (rechargement à chaud)
pnpm build      # vérification des types, bundling et packaging avec electron-builder
```

---

## Avis de non-responsabilité

EVE Online® ainsi que tous les noms, logos et ressources associés sont la propriété de CCP Games.

---

## Licence

MIT — voir [LICENSE](../LICENSE).
