import { app } from 'electron'
import { readdir, mkdir, stat, copyFile, writeFile, readFile } from 'node:fs/promises'
import { join, basename, dirname } from 'node:path'
import type { Backup } from './types.js'

function getBackupRoot(): string {
  return join(app.getPath('userData'), 'backups')
}

async function readMeta(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(join(getBackupRoot(), 'meta.json'), 'utf8'))
  } catch {
    return {}
  }
}

async function updateMeta(name: string, displayName: string): Promise<void> {
  const meta = await readMeta()
  meta[name] = displayName
  await writeFile(join(getBackupRoot(), 'meta.json'), JSON.stringify(meta), 'utf8')
}

async function removeMeta(name: string): Promise<void> {
  const root = getBackupRoot()
  const meta = await readMeta()
  if (!Object.keys(meta).length && !(name in meta)) return
  delete meta[name]
  try {
    await writeFile(join(root, 'meta.json'), JSON.stringify(meta), 'utf8')
  } catch { /* backup root may not exist if there are no backups */ }
}

/**
 * Creates a named backup of all .dat files in a profile directory.
 * Files are copied into: <userData>/backups/<name>/
 */
export async function createBackup(profilePath: string, name: string): Promise<Backup> {
  const backupPath = join(getBackupRoot(), name)
  await mkdir(backupPath, { recursive: true })

  const entries = await readdir(profilePath, { withFileTypes: true })
  const datFiles = entries.filter(e => e.isFile() && e.name.endsWith('.dat'))
  await Promise.all(datFiles.map(e => copyFile(join(profilePath, e.name), join(backupPath, e.name))))

  return {
    type: 'folder',
    name,
    path: backupPath,
    createdAt: Date.now(),
    fileCount: datFiles.length,
  }
}

/**
 * Creates a backup of a single .dat file.
 * File is copied into: <userData>/backups/<name>.dat
 * Display name is stored in <userData>/backups/meta.json.
 */
export async function createFileBackup(profilePath: string, sourcePath: string, name: string, displayName?: string): Promise<Backup> {
  const root = getBackupRoot()
  await mkdir(root, { recursive: true })
  const destPath = join(root, `${name}.dat`)
  await copyFile(sourcePath, destPath)
  if (displayName) await updateMeta(name, displayName)
  return {
    type: 'file',
    name,
    displayName,
    path: destPath,
    createdAt: Date.now(),
    fileCount: 1,
  }
}

/**
 * Lists all backups, newest first.
 */
export async function listBackups(): Promise<Backup[]> {
  const root = getBackupRoot()

  let entries: Awaited<ReturnType<typeof readdir>>
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return []
  }

  const meta = await readMeta()

  const backups = await Promise.all([
    // Folder backups — subdirectories
    ...entries
      .filter(e => e.isDirectory())
      .map(async e => {
        const backupPath = join(root, e.name)
        const files = await readdir(backupPath)
        const s = await stat(backupPath)
        return {
          type: 'folder' as const,
          name: e.name,
          path: backupPath,
          createdAt: s.birthtimeMs,
          fileCount: files.filter(f => f.endsWith('.dat')).length,
        }
      }),
    // File backups — .dat files at root level
    ...entries
      .filter(e => e.isFile() && e.name.endsWith('.dat'))
      .map(async e => {
        const filePath = join(root, e.name)
        const name = e.name.replace(/\.dat$/, '')
        const s = await stat(filePath)
        return {
          type: 'file' as const,
          name,
          displayName: meta[name],
          path: filePath,
          createdAt: s.birthtimeMs,
          fileCount: 1,
        }
      }),
  ])

  return backups.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Restores a folder backup by copying its .dat files into the profile directory.
 */
export async function restoreBackup(profilePath: string, backupPath: string): Promise<void> {
  const entries = await readdir(backupPath, { withFileTypes: true })
  const datFiles = entries.filter(e => e.isFile() && e.name.endsWith('.dat'))
  await Promise.all(datFiles.map(e => copyFile(join(backupPath, e.name), join(profilePath, e.name))))
}

/**
 * Puts a single file backup back into the profile directory.
 */
export async function restoreFileBackup(profilePath: string, backupFilePath: string): Promise<void> {
  await copyFile(backupFilePath, join(profilePath, basename(backupFilePath)))
}

/**
 * Deletes a named folder backup directory.
 */
export async function deleteBackup(backupPath: string): Promise<void> {
  const { rm } = await import('node:fs/promises')
  await rm(backupPath, { recursive: true, force: true })
}

/**
 * Deletes a single file backup and removes its entry from meta.json.
 */
export async function deleteFileBackup(backupFilePath: string): Promise<void> {
  const { rm } = await import('node:fs/promises')
  await rm(backupFilePath, { force: true })
  const name = basename(backupFilePath).replace(/\.dat$/, '')
  await removeMeta(name)
}
