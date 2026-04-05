# TODO

Beta feedback items from testers (2026-04-05).

## Bugs

- [x] **Backup single file fails on Windows** — folder backup works fine; likely a path separator or file handling issue specific to Windows.
- [ ] **Backup path is one level too deep** — backup destination is nested one extra directory deeper than expected.

## Windows / Platform

- [x] **Increase default window size on Windows** — tables display too narrow; text wraps badly. Set a larger default width/height.
- [ ] **Hide system menu bar on Windows** — the default Electron menu bar is visible; hide it. Also review macOS behavior (native menu bar conventions).

## UI / UX

- [ ] **Table: hide character name and account notes when window is narrow** — when the window is too narrow, hide these columns or show them on hover/tooltip.
- [x] **Show account notes in sync accounts dialog** — if an account has a note, display it in the picker so users can tell accounts apart.
- [ ] **Info button should open README in current UI language** — currently always opens English README. Should match the selected language, fall back to English if no localized version exists. (May already be fixed on `electron-vue-refactor` — verify before fixing.)

## Servers

- [x] **Add Tornado server** — temporary China tournament server. Folder keyword: `tornado` (e.g. `_tornado`). No ESI endpoint. Just needs a display name in the server list; no i18n required.
