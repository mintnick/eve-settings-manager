# EVE Settings Manager

**EVE Online Settings Manager** é um aplicativo desktop para gerenciar seus arquivos de configuração locais do EVE Online — copie layouts de interface entre personagens, faça backup e restaure perfis, e adicione notas a cada conta, sem precisar abrir o cliente do jogo.

**Idiomas:**
[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-CHT.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [Polski](README.pl.md)

---

## Como começar

1. Acesse a página de [Releases](https://github.com/mintnick/eve-settings-manager/releases/latest).
2. Baixe o arquivo para sua plataforma:
   - **macOS:** `.dmg` — abra e arraste o app para a pasta Aplicativos
   - **Windows:** `.exe` — execute diretamente, sem instalação
   - **Linux:** `.AppImage` — torne executável e execute

> **Nota macOS:** O app ainda não possui assinatura de código. No primeiro lançamento, o macOS pode informar que está "danificado e não pode ser aberto". A solução mais confiável é executar o seguinte comando no Terminal e depois abrir o app normalmente:
> ```bash
> xattr -cr "/Applications/EVE Settings Manager.app"
> ```
> Alternativamente, o macOS exibe um botão **Abrir Mesmo Assim** em Preferências do Sistema → Privacidade e Segurança por cerca de 1 hora após o lançamento bloqueado. Se o botão não aparecer, use o comando do Terminal acima.

---

## Armazenamento de dados

Todos os dados persistentes são armazenados localmente — nada é enviado a servidores externos.

| Plataforma | Dados locais |
|---|---|
| macOS | `~/Library/Application Support/eve-settings-manager/` |
| Windows | `%APPDATA%\eve-settings-manager\` |
| Linux | `~/.config/eve-settings-manager/` |

---

## Desinstalação

- **macOS:** Exclua o app da pasta Aplicativos. A pasta de dados local **não é removida automaticamente** — exclua manualmente se desejar: `~/Library/Application Support/eve-settings-manager`
- **Windows:** Exclua o arquivo `.exe`. Para remover tudo, exclua também a pasta de dados: `%APPDATA%\eve-settings-manager`
- **Linux:** Exclua o arquivo `.AppImage`. Para remover tudo, exclua também a pasta de dados: `~/.config/eve-settings-manager`

---

## Compilar a partir do código-fonte

**Pré-requisitos:** Node.js 18+, pnpm

```bash
git clone https://github.com/mintnick/eve-settings-manager.git
cd eve-settings-manager
pnpm install
pnpm dev        # inicia o servidor de desenvolvimento + Electron (hot reload)
pnpm build      # verificação de tipos, bundling e empacotamento com electron-builder
```

---

## Aviso legal

EVE Online® e todos os nomes, logotipos e ativos relacionados são propriedade da CCP Games.

---

## Licença

MIT — consulte [LICENSE](../LICENSE).
