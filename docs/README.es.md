# EVE Settings Manager

**EVE Online Settings Manager** es una aplicación de escritorio para gestionar tus archivos de configuración locales de EVE Online — copia diseños de interfaz entre personajes, realiza copias de seguridad y restaura perfiles, y añade notas a cada cuenta, sin necesidad de abrir el cliente del juego.

**Idiomas:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md)

---

## Funcionalidades

- **Cambio de servidor** — Tranquility, Serenity, Singularity, Infinity, Thunderdome; detección automática desde la carpeta de instalación de EVE
- **Gestión de perfiles** — crea, renombra, duplica y elimina perfiles de configuración (las subcarpetas `settings_*` que usa EVE)
- **Lista de personajes** — muestra todos los archivos de personaje con nombres resueltos mediante la API ESI y marcas de tiempo de modificación
- **Lista de cuentas** — muestra todos los archivos de cuenta; añade una nota personal a cada cuenta para recordar para qué sirve
- **Sincronización de ajustes** — copia el diseño de interfaz de un personaje o cuenta a varios destinos con un solo clic
- **Copia de seguridad de archivo** — guarda un archivo individual de personaje o cuenta; restáuralo con un clic
- **Copia de seguridad de carpeta** — crea una instantánea con nombre del perfil completo; restáurala o elimínala desde la barra lateral
- **Tema oscuro / claro** — oscuro por defecto; la preferencia se guarda entre sesiones
- **8 idiomas** — English, 简体中文, 繁體中文, 日本語, 한국어, Français, Deutsch, Español

---

## Stack tecnológico

| Capa | Biblioteca |
|---|---|
| Shell de escritorio | Electron 29 |
| Framework UI | Vue 3 + TypeScript |
| Biblioteca de componentes | Element Plus |
| Gestión de estado | Pinia |
| Internacionalización | vue-i18n |
| Herramienta de build | Vite + vite-plugin-electron |
| Persistencia | electron-store |

---

## Primeros pasos

**Requisitos previos:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # inicia el servidor de desarrollo + Electron (recarga en caliente)
```

### Build

```bash
pnpm build      # verificación de tipos, bundling y empaquetado con electron-builder
```

La salida se escribe en `release/<versión>/`.

---

## Almacenamiento de datos

Todos los datos persistentes (notas, tema, idioma, memoria de servidor, caché de nombres de personajes) se almacenan localmente en un archivo JSON — no se envía nada a ningún servidor externo.

| Plataforma | Ruta |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` |

---

## Desinstalación

Desinstalar la aplicación **no elimina** la carpeta de datos local. Para borrar todo por completo, desinstala la app y luego elimina manualmente la siguiente carpeta:

- **macOS:** `~/Library/Application Support/eve-settings-manager`
- **Windows:** `%APPDATA%\eve-settings-manager`

---

## Licencia

MIT — consulta [LICENSE](../LICENSE).
