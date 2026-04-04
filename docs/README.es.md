# EVE Settings Manager

**EVE Online Settings Manager** es una aplicación de escritorio para gestionar tus archivos de configuración locales de EVE Online — copia diseños de interfaz entre personajes, realiza copias de seguridad y restaura perfiles, y añade notas a cada cuenta, sin necesidad de abrir el cliente del juego.

**Idiomas:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Funcionalidades

- **Cambio de servidor** — Tranquility, Serenity, Singularity, Infinity, Thunderdome; detección automática desde la carpeta de instalación de EVE
- **Gestión de perfiles** — crea, renombra, duplica y elimina perfiles de configuración (las subcarpetas `settings_*` que usa EVE)
- **Lista de personajes** — muestra todos los archivos de personaje con nombres resueltos mediante la API ESI y marcas de tiempo de modificación
- **Lista de cuentas** — muestra todos los archivos de cuenta; añade una nota personal a cada cuenta para recordar para qué sirve
- **Sincronización de ajustes** — copia el diseño de interfaz de un personaje o cuenta a varios destinos con un solo clic
- **Copia de seguridad de archivo** — guarda un archivo individual de personaje o cuenta; restáuralo con un clic
- **Copia de seguridad de carpeta** — crea una instantánea con nombre del perfil completo; restáurala o elimínala desde la barra lateral
- **Tema oscuro / claro** — oscuro por defecto; sigue el tema del sistema en el primer lanzamiento; la preferencia se guarda entre sesiones
- **11 idiomas** — English, 简体中文, 繁體中文, Русский, Deutsch, Français, Español, Português (BR), 한국어, 日本語, Polski

---

## Stack tecnológico

| Capa | Biblioteca |
|---|---|
| Shell de escritorio | Electron 41 |
| Framework UI | Vue 3 + TypeScript |
| Biblioteca de componentes | Element Plus |
| Gestión de estado | Pinia |
| Internacionalización | vue-i18n |
| Herramienta de build | Vite + vite-plugin-electron |
| Persistencia | electron-store |

---

## Primeros pasos

1. Ve a la página de [Releases](https://github.com/mintnick/eve-settings-manager/releases).
2. Descarga el archivo para tu plataforma:
   - **macOS:** `.dmg` — ábrelo y arrastra la app a Aplicaciones
   - **Windows:** `.exe` — ejecútalo directamente, sin instalación

> **Nota macOS:** La app aún no está firmada con código. Al primer lanzamiento, macOS puede indicar que está «dañada y no puede abrirse». La solución más fiable es ejecutar el siguiente comando en la Terminal y luego abrir la app normalmente:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternativamente, macOS muestra un botón **Abrir de todas formas** en Ajustes del Sistema → Privacidad y Seguridad durante aproximadamente 1 hora después del lanzamiento bloqueado. Si no aparece ese botón, usa el comando de Terminal indicado arriba.

---

## Almacenamiento de datos

Todos los datos persistentes se almacenan localmente — no se envía nada a ningún servidor externo.

| Plataforma | Configuración | Copias de seguridad |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## Desinstalación

- **macOS:** Elimina la app de la carpeta Aplicaciones. La carpeta de datos local (que incluye la configuración y todas las copias de seguridad) **no se elimina automáticamente** — bórrala manualmente si lo deseas: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Elimina el archivo `.exe`. Para borrar todo, elimina también la carpeta de datos (que incluye la configuración y todas las copias de seguridad): `%APPDATA%\eve-settings-manager`

---

## Compilar desde el código fuente

**Requisitos previos:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # inicia el servidor de desarrollo + Electron (recarga en caliente)
```

```bash
pnpm build      # verificación de tipos, bundling y empaquetado con electron-builder
```

La salida se escribe en `release/<versión>/`.

---

## Licencia

MIT — consulta [LICENSE](../LICENSE).
