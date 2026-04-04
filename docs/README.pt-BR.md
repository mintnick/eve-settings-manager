# EVE Settings Manager

**EVE Online Settings Manager** é um aplicativo desktop para gerenciar seus arquivos de configuração locais do EVE Online — copie layouts de interface entre personagens, faça backup e restaure perfis, e adicione notas a cada conta, sem precisar abrir o cliente do jogo.

**Idiomas:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Funcionalidades

- **Troca de servidor** — Tranquility, Serenity, Singularity, Infinity, Thunderdome; detecção automática a partir da pasta de instalação do EVE
- **Gerenciamento de perfis** — crie, renomeie, duplique e exclua perfis de configuração (as subpastas `settings_*` usadas pelo EVE)
- **Lista de personagens** — exibe todos os arquivos de personagem com nomes resolvidos via API ESI e timestamps de modificação
- **Lista de contas** — exibe todos os arquivos de conta; adicione uma nota pessoal a cada conta para lembrar para que serve
- **Sincronização de configurações** — copie o layout de interface de um personagem ou conta para vários outros com um clique
- **Backup de arquivo** — salve um arquivo individual de personagem ou conta; restaure com um clique
- **Backup de pasta** — crie um snapshot nomeado do perfil inteiro; restaure ou exclua pela barra lateral
- **Tema escuro / claro** — escuro por padrão; segue o tema do sistema no primeiro lançamento; preferência salva entre sessões
- **11 idiomas** — English, 简体中文, 繁體中文, Русский, Deutsch, Français, Español, Português (BR), 한국어, 日本語, Polski

---

## Stack tecnológico

| Camada | Biblioteca |
|---|---|
| Shell desktop | Electron 41 |
| Framework UI | Vue 3 + TypeScript |
| Biblioteca de componentes | Element Plus |
| Gerenciamento de estado | Pinia |
| Internacionalização | vue-i18n |
| Ferramenta de build | Vite + vite-plugin-electron |
| Persistência | electron-store |

---

## Como começar

1. Acesse a página de [Releases](https://github.com/mintnick/eve-settings-manager/releases).
2. Baixe o arquivo para sua plataforma:
   - **macOS:** `.dmg` — abra e arraste o app para a pasta Aplicativos
   - **Windows:** `.exe` — execute diretamente, sem instalação

> **Nota macOS:** O app ainda não possui assinatura de código. No primeiro lançamento, o macOS pode informar que está "danificado e não pode ser aberto". A solução mais confiável é executar o seguinte comando no Terminal e depois abrir o app normalmente:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternativamente, o macOS exibe um botão **Abrir Mesmo Assim** em Preferências do Sistema → Privacidade e Segurança por cerca de 1 hora após o lançamento bloqueado. Se o botão não aparecer, use o comando do Terminal acima.

---

## Armazenamento de dados

Todos os dados persistentes são armazenados localmente — nada é enviado a servidores externos.

| Plataforma | Configuração | Backups |
|---|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/config.json` | `~/Library/Application Support/eve-settings-manager/backups/` |
| Windows | `%APPDATA%\eve-settings-manager\config.json` | `%APPDATA%\eve-settings-manager\backups\` |

---

## Desinstalação

- **macOS:** Exclua o app da pasta Aplicativos. A pasta de dados local (contendo a configuração e todos os backups) **não é removida automaticamente** — exclua manualmente se desejar: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Exclua o arquivo `.exe`. Para remover tudo, exclua também a pasta de dados (contendo a configuração e todos os backups): `%APPDATA%\eve-settings-manager`

---

## Compilar a partir do código-fonte

**Pré-requisitos:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # inicia o servidor de desenvolvimento + Electron (hot reload)
```

```bash
pnpm build      # verificação de tipos, bundling e empacotamento com electron-builder
```

A saída é gravada em `release/<versão>/`.

---

## Licença

MIT — consulte [LICENSE](../LICENSE).
