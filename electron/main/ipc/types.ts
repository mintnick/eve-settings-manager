export interface ServerDir {
  name: string   // directory name, e.g. '_c_tranquility'
  path: string   // absolute path
}

export interface Profile {
  name: string   // e.g. 'Default', 'Custom'
  path: string   // absolute path to settings_<name> dir
}

export interface CharFile {
  type: 'char'
  id: string         // e.g. '2113229062'
  filename: string   // e.g. 'core_char_2113229062.dat'
  path: string
  modifiedAt: number // ms timestamp
  charName?: string  // resolved via ESI
}

export interface UserFile {
  type: 'user'
  id: string
  filename: string
  path: string
  modifiedAt: number
}

export type SettingsFile = CharFile | UserFile

export interface Backup {
  name: string
  path: string
  createdAt: number
  fileCount: number
}

export interface SavedSnapshot {
  name: string
  path: string
  fileType: 'char' | 'user'
  server: string
  createdAt: number
}

export interface ServerStatus {
  online: boolean
  players?: number
  error?: string
}

export type EsiServer = 'tq' | 'serenity' | 'infinity'
