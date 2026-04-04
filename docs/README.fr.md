# EVE Settings Manager

**EVE Online Settings Manager** est une application de bureau pour gérer vos fichiers de paramètres EVE Online locaux — copiez des mises en page entre personnages, sauvegardez et restaurez des profils, et ajoutez des notes à chaque compte, sans lancer le client de jeu.

**Langues :**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Fonctionnalités

- **Changement de serveur** — Tranquility, Serenity, Singularity, Infinity, Thunderdome ; détection automatique depuis le dossier d'installation EVE
- **Gestion des profils** — créer, renommer, dupliquer et supprimer des profils de paramètres (les sous-dossiers `settings_*` utilisés par EVE)
- **Liste des personnages** — affiche tous les fichiers de personnages avec les noms résolus via l'API ESI et les horodatages de modification
- **Liste des comptes** — affiche tous les fichiers de comptes ; ajoutez une note personnelle à chaque compte pour vous rappeler à quoi il sert
- **Synchronisation des paramètres** — copiez la mise en page UI d'un personnage ou d'un compte vers plusieurs autres en un clic
- **Sauvegarde de fichier** — sauvegardez un fichier de personnage ou de compte unique ; restaurez-le en un clic
- **Sauvegarde de dossier** — créez un instantané nommé du profil entier ; restaurez ou supprimez depuis la barre latérale
- **Thème sombre / clair** — sombre par défaut ; suit le thème système au premier lancement ; préférence sauvegardée entre les sessions
- **11 langues** — English, 简体中文, 繁體中文, Русский, Deutsch, Français, Español, Português (BR), 한국어, 日本語, Polski

---

## Stack technique

| Couche | Bibliothèque |
|---|---|
| Shell bureau | Electron 41 |
| Framework UI | Vue 3 + TypeScript |
| Bibliothèque de composants | Element Plus |
| Gestion d'état | Pinia |
| Internationalisation | vue-i18n |
| Outil de build | Vite + vite-plugin-electron |
| Persistance | electron-store |

---

## Démarrage rapide

1. Rendez-vous sur la page [Releases](https://github.com/mintnick/eve-settings-manager/releases).
2. Téléchargez le fichier pour votre plateforme :
   - **macOS :** `.dmg` — ouvrez-le et glissez l'app dans le dossier Applications
   - **Windows :** `.exe` — lancez-le directement, aucune installation requise

> **Note macOS :** L'app n'est pas encore signée. Au premier lancement, macOS peut indiquer qu'elle est « endommagée et ne peut pas être ouverte ». La solution la plus fiable est d'exécuter la commande suivante dans le Terminal, puis d'ouvrir l'app normalement :
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternativement, macOS affiche un bouton **Ouvrir quand même** dans Réglages Système → Confidentialité & Sécurité pendant environ 1 heure après le lancement bloqué. Si ce bouton n'apparaît pas, utilisez la commande Terminal ci-dessus.

---

## Stockage des données

Toutes les données persistantes sont stockées localement — rien n'est envoyé à un serveur externe.

| Plateforme | Configuration | Sauvegardes |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## Désinstallation

- **macOS :** Supprimez l'app du dossier Applications. Le dossier de données local (incluant la configuration et toutes les sauvegardes) **n'est pas supprimé automatiquement** — effacez-le manuellement si besoin : `~/Library/Application Support/eve-settings-manager`
- **Windows :** Supprimez le fichier `.exe`. Pour tout effacer, supprimez également le dossier de données (incluant la configuration et toutes les sauvegardes) : `%APPDATA%\eve-settings-manager`

---

## Compiler depuis les sources

**Prérequis :** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # lance le serveur de développement + Electron (rechargement à chaud)
```

```bash
pnpm build      # vérification des types, bundling et packaging avec electron-builder
```

La sortie est écrite dans `release/<version>/`.

---

## Licence

MIT — voir [LICENSE](../LICENSE).
