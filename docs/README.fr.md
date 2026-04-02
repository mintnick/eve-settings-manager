# EVE Settings Manager

**EVE Online Settings Manager** est une application de bureau pour gérer vos fichiers de paramètres EVE Online locaux — copiez des mises en page entre personnages, sauvegardez et restaurez des profils, et ajoutez des notes à chaque compte, sans lancer le client de jeu.

**Langues :**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Español](README.es.md)

---

## Fonctionnalités

- **Changement de serveur** — Tranquility, Serenity, Singularity, Infinity, Thunderdome ; détection automatique depuis le dossier d'installation EVE
- **Gestion des profils** — créer, renommer, dupliquer et supprimer des profils de paramètres (les sous-dossiers `settings_*` utilisés par EVE)
- **Liste des personnages** — affiche tous les fichiers de personnages avec les noms résolus via l'API ESI et les horodatages de modification
- **Liste des comptes** — affiche tous les fichiers de comptes ; ajoutez une note personnelle à chaque compte pour vous rappeler à quoi il sert
- **Synchronisation des paramètres** — copiez la mise en page UI d'un personnage ou d'un compte vers plusieurs autres en un clic
- **Sauvegarde de fichier** — sauvegardez un fichier de personnage ou de compte unique ; restaurez-le en un clic
- **Sauvegarde de dossier** — créez un instantané nommé du profil entier ; restaurez ou supprimez depuis la barre latérale
- **Thème sombre / clair** — sombre par défaut ; préférence sauvegardée entre les sessions
- **8 langues** — English, 简体中文, 繁體中文, 日本語, 한국어, Français, Deutsch, Español

---

## Stack technique

| Couche | Bibliothèque |
|---|---|
| Shell bureau | Electron 29 |
| Framework UI | Vue 3 + TypeScript |
| Bibliothèque de composants | Element Plus |
| Gestion d'état | Pinia |
| Internationalisation | vue-i18n |
| Outil de build | Vite + vite-plugin-electron |
| Persistance | electron-store |

---

## Démarrage rapide

**Prérequis :** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # lance le serveur de développement + Electron (rechargement à chaud)
```

### Build

```bash
pnpm build      # vérification des types, bundling et packaging avec electron-builder
```

La sortie est écrite dans `release/<version>/`.

---

## Stockage des données

Toutes les données persistantes (notes, thème, langue, mémoire du serveur, cache des noms de personnages) sont stockées localement dans un fichier JSON — rien n'est envoyé à un serveur externe.

| Plateforme | Chemin |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## Désinstallation

La désinstallation de l'application **ne supprime pas** le dossier de données local. Pour tout supprimer complètement, désinstallez l'application puis supprimez manuellement le dossier suivant :

- **macOS :** `~/Library/Application Support/eve-settings-manager`
- **Windows :** `%APPDATA%\eve-settings-manager`

---

## Licence

MIT — voir [LICENSE](../LICENSE).
