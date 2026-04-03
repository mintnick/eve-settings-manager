// Shared types mirroring electron/main/ipc/types.ts
// The renderer can't import from the main process, so we keep these in sync manually.

export interface ServerDir {
  name: string          // e.g. '_c_tranquility'
  path: string
  displayName: string   // e.g. 'Tranquility'
}

export interface Profile {
  name: string   // e.g. 'Default'
  path: string
}

export interface CharFile {
  type: 'char'
  id: string
  filename: string
  path: string
  modifiedAt: number
  charName?: string
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
  type: 'folder' | 'file'
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
  error?: string
}

export type EsiServer = 'tq' | 'serenity' | 'infinity' | 'singularity' | 'other'
