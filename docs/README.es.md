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

## Seleccionar la carpeta de configuración

Al iniciarse, la aplicación busca automáticamente la carpeta de configuración de EVE. Si no se encuentra o necesita indicar otra ubicación, haga clic en **Seleccionar carpeta de configuración manualmente**.

**Ubicaciones predeterminadas:**

| Plataforma | Ruta predeterminada |
|---|---|
| macOS | `~/Library/Application Support/CCP/EVE` |
| Windows | `%LOCALAPPDATA%\CCP\EVE` |
| Linux | depende del prefijo de Wine / Proton |

**Razones por las que puede no encontrarse automáticamente:**

- EVE está instalado en un directorio no estándar
- Se usa un lanzador personalizado, Wine o Proton en Linux/macOS
- Hay varias instalaciones de EVE o clientes regionales (p. ej., Serenity/Infinity)

**Estructura de la carpeta:**

La carpeta debe contener una o más subcarpetas con nombres de servidor (p. ej., `c_tranquility`, `_tq_tranquility`, `c_serenity`). Dentro de cada carpeta de servidor hay carpetas de perfil (`settings_Default`, `settings_Custom`, etc.) que contienen los archivos de configuración `.dat`.

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

**Consejo:** Puede seleccionar la carpeta raíz del juego (p. ej., `CCP/EVE`) o navegar directamente a una subcarpeta de servidor (p. ej., `c_tranquility`) — la aplicación lo detecta automáticamente.

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

EVE Online® y todos los nombres, logotipos y recursos relacionados son propiedad de CCP Games.

---

## Licencia

MIT — consulta [LICENSE](../LICENSE).
