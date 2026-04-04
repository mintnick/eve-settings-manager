# EVE Settings Manager

**EVE Online Settings Manager** es una aplicación de escritorio para gestionar tus archivos de configuración locales de EVE Online — copia diseños de interfaz entre personajes, realiza copias de seguridad y restaura perfiles, y añade notas a cada cuenta, sin necesidad de abrir el cliente del juego.

**Idiomas:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Português (BR)](README.pt-BR.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Primeros pasos

1. Ve a la página de [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest).
2. Descarga el archivo para tu plataforma:
   - **macOS:** `.dmg` — ábrelo y arrastra la app a Aplicaciones
   - **Windows:** `.exe` — ejecútalo directamente, sin instalación
   - **Linux:** `.AppImage` — hazlo ejecutable y ejecútalo

> **Nota macOS:** La app aún no está firmada con código. Al primer lanzamiento, macOS puede indicar que está «dañada y no puede abrirse». La solución más fiable es ejecutar el siguiente comando en la Terminal y luego abrir la app normalmente:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternativamente, macOS muestra un botón **Abrir de todas formas** en Ajustes del Sistema → Privacidad y Seguridad durante aproximadamente 1 hora después del lanzamiento bloqueado. Si no aparece ese botón, usa el comando de Terminal indicado arriba.

---

## Almacenamiento de datos

Todos los datos persistentes se almacenan localmente — no se envía nada a ningún servidor externo.

| Plataforma | Datos locales |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## Desinstalación

- **macOS:** Elimina la app de la carpeta Aplicaciones. La carpeta de datos local **no se elimina automáticamente** — bórrala manualmente si lo deseas: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Elimina el archivo `.exe`. Para borrar todo, elimina también la carpeta de datos: `%APPDATA%\eve-settings-manager`
- **Linux:** Elimina el archivo `.AppImage`. Para borrar todo, elimina también la carpeta de datos: `~/.config/eve-settings-manager`

---

## Compilar desde el código fuente

**Requisitos previos:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # inicia el servidor de desarrollo + Electron (recarga en caliente)
pnpm build      # verificación de tipos, bundling y empaquetado con electron-builder
```

---

## Aviso legal

EVE Online y todos sus logotipos, nombres y recursos relacionados son propiedad de CCP hf. Este proyecto no está afiliado ni respaldado por CCP hf.

---

## Licencia

MIT — consulta [LICENSE](../LICENSE).
