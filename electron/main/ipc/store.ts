import ElectronStore from 'electron-store'

interface StoreSchema {
  descriptions: Record<string, string>   // filename → user label
  serverFolders: Record<string, string>  // serverDirName → custom folder path
  serverProfiles: Record<string, string> // serverDirName → last used profile name
  charNames: Record<string, string>      // characterId → character name (ESI cache)
  lastActiveServer: string               // last-selected server dir name
  customEveFolder: string                // user-selected EVE folder override
  language: string
}

const defaults: StoreSchema = {
  descriptions: {},
  serverFolders: {},
  serverProfiles: {},
  charNames: {},
  lastActiveServer: '',
  customEveFolder: '',
  language: 'en',
}

let _store: ElectronStore<StoreSchema> | null = null

function store(): ElectronStore<StoreSchema> {
  if (!_store) _store = new ElectronStore<StoreSchema>({ defaults })
  return _store
}

// ── Descriptions ─────────────────────────────────────────────────────────────

export function getDescription(filename: string): string {
  return store().get('descriptions')[filename] ?? ''
}

export function setDescription(filename: string, value: string): void {
  const descriptions = { ...store().get('descriptions'), [filename]: value }
  store().set('descriptions', descriptions)
}

export function deleteDescription(filename: string): void {
  const descriptions = { ...store().get('descriptions') }
  delete descriptions[filename]
  store().set('descriptions', descriptions)
}

// ── Per-server memory ─────────────────────────────────────────────────────────

export function getServerFolder(serverName: string): string | undefined {
  return store().get('serverFolders')[serverName]
}

export function setServerFolder(serverName: string, folderPath: string): void {
  store().set('serverFolders', { ...store().get('serverFolders'), [serverName]: folderPath })
}

export function getServerProfile(serverName: string): string | undefined {
  return store().get('serverProfiles')[serverName]
}

export function setServerProfile(serverName: string, profileName: string): void {
  store().set('serverProfiles', { ...store().get('serverProfiles'), [serverName]: profileName })
}

// ── Last active server ────────────────────────────────────────────────────────

export function getLastActiveServer(): string {
  return store().get('lastActiveServer')
}

export function setLastActiveServer(serverName: string): void {
  store().set('lastActiveServer', serverName)
}

// ── Character name cache ──────────────────────────────────────────────────────

export function getCachedCharNames(): Record<string, string> {
  return store().get('charNames')
}

export function setCachedCharNames(names: Record<string, string>): void {
  store().set('charNames', { ...store().get('charNames'), ...names })
}

// ── Custom EVE folder ─────────────────────────────────────────────────────────

export function getCustomEveFolder(): string {
  return store().get('customEveFolder')
}

export function setCustomEveFolder(path: string): void {
  store().set('customEveFolder', path)
}

// ── App config ────────────────────────────────────────────────────────────────

export function getLanguage(): string {
  return store().get('language')
}

export function setLanguage(lang: string): void {
  store().set('language', lang)
}
