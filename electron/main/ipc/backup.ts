import { readdir, mkdir, stat, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Backup } from './types.js'

const FILE_BACKUPS_DIR = 'Backups'

/**
 * Creates a named backup of all .dat files in a profile directory.
 * Files are copied into: <profilePath>/<name>/
 */
export async function createBackup(profilePath: string, name: string): Promise<Backup> {
  const backupPath = join(profilePath, name)
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
 * File is copied into: <profilePath>/Backups/<name>.dat
 */
export async function createFileBackup(profilePath: string, sourcePath: string, name: string): Promise<Backup> {
  const backupsDir = join(profilePath, FILE_BACKUPS_DIR)
  await mkdir(backupsDir, { recursive: true })
  const destPath = join(backupsDir, `${name}.dat`)
  await copyFile(sourcePath, destPath)
  return {
    type: 'file',
    name,
    path: destPath,
    createdAt: Date.now(),
    fileCount: 1,
  }
}

/**
 * Lists all backups for a profile (folder backups + individual file backups), newest first.
 */
export async function listBackups(profilePath: string): Promise<Backup[]> {
  const results: Backup[] = []

  try {
    const entries = await readdir(profilePath, { withFileTypes: true })
    const folderBackups = await Promise.all(
      entries
        .filter(e => e.isDirectory() && e.name !== FILE_BACKUPS_DIR)
        .map(async e => {
          const backupPath = join(profilePath, e.name)
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
    )
    results.push(...folderBackups)
  } catch { /* profile dir unreadable */ }

  try {
    const backupsDir = join(profilePath, FILE_BACKUPS_DIR)
    const entries = await readdir(backupsDir, { withFileTypes: true })
    const fileBackups = await Promise.all(
      entries
        .filter(e => e.isFile() && e.name.endsWith('.dat'))
        .map(async e => {
          const filePath = join(backupsDir, e.name)
          const s = await stat(filePath)
          return {
            type: 'file' as const,
            name: e.name.replace(/\.dat$/, ''),
            path: filePath,
            createdAt: s.birthtimeMs,
            fileCount: 1,
          }
        }),
    )
    results.push(...fileBackups)
  } catch { /* Backups dir doesn't exist yet */ }

  return results.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Restores a named folder backup by copying its .dat files back into the profile directory.
 */
export async function restoreBackup(profilePath: string, backupName: string): Promise<void> {
  const backupPath = join(profilePath, backupName)
  const entries = await readdir(backupPath, { withFileTypes: true })
  const datFiles = entries.filter(e => e.isFile() && e.name.endsWith('.dat'))
  await Promise.all(datFiles.map(e => copyFile(join(backupPath, e.name), join(profilePath, e.name))))
}

/**
 * Puts a single file backup back into the profile directory (overwrites).
 * The backup name matches the original filename, so no mapping is needed.
 */
export async function restoreFileBackup(profilePath: string, backupName: string): Promise<void> {
  const src = join(profilePath, FILE_BACKUPS_DIR, `${backupName}.dat`)
  const dest = join(profilePath, `${backupName}.dat`)
  await copyFile(src, dest)
}

/**
 * Deletes a named folder backup directory.
 */
export async function deleteBackup(profilePath: string, backupName: string): Promise<void> {
  const { rm } = await import('node:fs/promises')
  await rm(join(profilePath, backupName), { recursive: true, force: true })
}

/**
 * Deletes a single file backup from the Backups subfolder.
 */
export async function deleteFileBackup(profilePath: string, backupName: string): Promise<void> {
  const { rm } = await import('node:fs/promises')
  await rm(join(profilePath, FILE_BACKUPS_DIR, `${backupName}.dat`), { force: true })
}
