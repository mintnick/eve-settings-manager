import { ipcMain, shell } from 'electron'
import { findEveFolder, openFolderDialog } from './folder.js'
import { detectServers, getServerStatus, inferEsiServer } from './server.js'
import { listProfiles, createProfile, renameProfile, duplicateProfile, deleteProfile } from './profile.js'
import { listSettings, resolveCharNames, copySettings } from './settings.js'
import { createBackup, createFileBackup, listBackups, restoreBackup, deleteBackup, deleteFileBackup } from './backup.js'
import {
  getDescription, setDescription, deleteDescription,
  getServerFolder, setServerFolder,
  getServerProfile, setServerProfile,
  getLastActiveServer, setLastActiveServer,
  getCustomEveFolder, setCustomEveFolder,
  getLanguage, setLanguage,
} from './store.js'

export function registerIpcHandlers(): void {
  // ── Folder ─────────────────────────────────────────────────────────────────
  ipcMain.handle('folder:find', (_e, customPath?: string) => findEveFolder(customPath))
  ipcMain.handle('folder:open-dialog', () => openFolderDialog())
  ipcMain.handle('folder:open-in-shell', (_e, path: string) => shell.openPath(path))
  ipcMain.handle('folder:show-in-shell', (_e, path: string) => shell.showItemInFolder(path))

  // ── Server ─────────────────────────────────────────────────────────────────
  ipcMain.handle('server:detect', (_e, eveFolder: string) => detectServers(eveFolder))
  ipcMain.handle('server:infer-esi', (_e, serverDirName: string) => inferEsiServer(serverDirName))
  ipcMain.handle('server:status', (_e, server: 'tq' | 'serenity' | 'infinity') => getServerStatus(server))

  // ── Profile ────────────────────────────────────────────────────────────────
  ipcMain.handle('profile:list', (_e, serverPath: string) => listProfiles(serverPath))
  ipcMain.handle('profile:create', (_e, serverPath: string, name: string) => createProfile(serverPath, name))
  ipcMain.handle('profile:rename', (_e, serverPath: string, oldName: string, newName: string) => renameProfile(serverPath, oldName, newName))
  ipcMain.handle('profile:duplicate', (_e, serverPath: string, sourceName: string, newName: string) => duplicateProfile(serverPath, sourceName, newName))
  ipcMain.handle('profile:delete', (_e, serverPath: string, name: string) => deleteProfile(serverPath, name))

  // ── Settings ───────────────────────────────────────────────────────────────
  ipcMain.handle('settings:list', (_e, profilePath: string) => listSettings(profilePath))
  ipcMain.handle('settings:resolve-names', (_e, ids: string[], server: 'tq' | 'serenity' | 'infinity') => resolveCharNames(ids, server))
  ipcMain.handle('settings:copy', (_e, srcPath: string, destPaths: string[]) => copySettings(srcPath, destPaths))

  // ── Backup ─────────────────────────────────────────────────────────────────
  ipcMain.handle('backup:create', (_e, profilePath: string, name: string) => createBackup(profilePath, name))
  ipcMain.handle('backup:create-file', (_e, profilePath: string, sourcePath: string, name: string) => createFileBackup(profilePath, sourcePath, name))
  ipcMain.handle('backup:list', (_e, profilePath: string) => listBackups(profilePath))
  ipcMain.handle('backup:restore', (_e, profilePath: string, backupName: string) => restoreBackup(profilePath, backupName))
  ipcMain.handle('backup:delete', (_e, profilePath: string, backupName: string) => deleteBackup(profilePath, backupName))
  ipcMain.handle('backup:delete-file', (_e, profilePath: string, backupName: string) => deleteFileBackup(profilePath, backupName))

  // ── Store ──────────────────────────────────────────────────────────────────
  ipcMain.handle('store:get-description', (_e, filename: string) => getDescription(filename))
  ipcMain.handle('store:set-description', (_e, filename: string, value: string) => setDescription(filename, value))
  ipcMain.handle('store:delete-description', (_e, filename: string) => deleteDescription(filename))
  ipcMain.handle('store:get-server-folder', (_e, serverName: string) => getServerFolder(serverName))
  ipcMain.handle('store:set-server-folder', (_e, serverName: string, path: string) => setServerFolder(serverName, path))
  ipcMain.handle('store:get-server-profile', (_e, serverName: string) => getServerProfile(serverName))
  ipcMain.handle('store:set-server-profile', (_e, serverName: string, profileName: string) => setServerProfile(serverName, profileName))
  ipcMain.handle('store:get-last-server', () => getLastActiveServer())
  ipcMain.handle('store:set-last-server', (_e, name: string) => setLastActiveServer(name))
  ipcMain.handle('store:get-custom-folder', () => getCustomEveFolder())
  ipcMain.handle('store:set-custom-folder', (_e, path: string) => setCustomEveFolder(path))
  ipcMain.handle('store:get-language', () => getLanguage())
  ipcMain.handle('store:set-language', (_e, lang: string) => setLanguage(lang))
}
