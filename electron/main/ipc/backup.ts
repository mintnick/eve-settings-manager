import { readdir, mkdir, stat, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Backup } from './types.js'

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
    name,
    path: backupPath,
    createdAt: Date.now(),
    fileCount: datFiles.length,
  }
}

/**
 * Lists all named backups for a profile, newest first.
 */
export async function listBackups(profilePath: string): Promise<Backup[]> {
  try {
    const entries = await readdir(profilePath, { withFileTypes: true })
    const backups = await Promise.all(
      entries
        .filter(e => e.isDirectory())
        .map(async e => {
          const backupPath = join(profilePath, e.name)
          const files = await readdir(backupPath)
          const s = await stat(backupPath)
          return {
            name: e.name,
            path: backupPath,
            createdAt: s.birthtimeMs,
            fileCount: files.filter(f => f.endsWith('.dat')).length,
          }
        }),
    )
    return backups.sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

/**
 * Restores a named backup by copying its .dat files back into the profile directory.
 */
export async function restoreBackup(profilePath: string, backupName: string): Promise<void> {
  const backupPath = join(profilePath, backupName)
  const entries = await readdir(backupPath, { withFileTypes: true })
  const datFiles = entries.filter(e => e.isFile() && e.name.endsWith('.dat'))
  await Promise.all(datFiles.map(e => copyFile(join(backupPath, e.name), join(profilePath, e.name))))
}

/**
 * Deletes a named backup directory.
 */
export async function deleteBackup(profilePath: string, backupName: string): Promise<void> {
  const { rm } = await import('node:fs/promises')
  await rm(join(profilePath, backupName), { recursive: true, force: true })
}
