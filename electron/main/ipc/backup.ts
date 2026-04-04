import { app } from 'electron'
import { readdir, mkdir, stat, copyFile, writeFile, readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'
import type { Backup } from './types.js'

function getBackupRoot(): string {
  return join(app.getPath('userData'), 'backups')
}

async function readMeta(profileBackupPath: string): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(join(profileBackupPath, 'meta.json'), 'utf8'))
  } catch {
    return {}
  }
}

async function updateMeta(profileBackupPath: string, name: string, displayName: string): Promise<void> {
  const meta = await readMeta(profileBackupPath)
  meta[name] = displayName
  await writeFile(join(profileBackupPath, 'meta.json'), JSON.stringify(meta), 'utf8')
}

async function removeMeta(profileBackupPath: string, name: string): Promise<void> {
  const meta = await readMeta(profileBackupPath)
  delete meta[name]
  await writeFile(join(profileBackupPath, 'meta.json'), JSON.stringify(meta), 'utf8')
}

/**
 * Creates a named backup of all .dat files in a profile directory.
 * Files are copied into: <userData>/backups/<profileName>/<name>/
 */
export async function createBackup(profilePath: string, profileName: string, name: string): Promise<Backup> {
  const backupPath = join(getBackupRoot(), profileName, name)
  await mkdir(backupPath, { recursive: true })

  const entries = await readdir(profilePath, { withFileTypes: true })
  const datFiles = entries.filter(e => e.isFile() && e.name.endsWith('.dat'))
  await Promise.all(datFiles.map(e => copyFile(join(profilePath, e.name), join(backupPath, e.name))))

  return {
    type: 'folder',
    name,
    profileName,
    path: backupPath,
    createdAt: Date.now(),
    fileCount: datFiles.length,
  }
}

/**
 * Creates a backup of a single .dat file.
 * File is copied into: <userData>/backups/<profileName>/<name>.dat
 * Display name is stored in the shared <profileName>/meta.json.
 */
export async function createFileBackup(profilePath: string, profileName: string, sourcePath: string, name: string, displayName?: string): Promise<Backup> {
  const profileBackupPath = join(getBackupRoot(), profileName)
  await mkdir(profileBackupPath, { recursive: true })
  const destPath = join(profileBackupPath, `${name}.dat`)
  await copyFile(sourcePath, destPath)
  if (displayName) await updateMeta(profileBackupPath, name, displayName)
  return {
    type: 'file',
    name,
    profileName,
    displayName,
    path: destPath,
    createdAt: Date.now(),
    fileCount: 1,
  }
}

/**
 * Lists all backups across all profiles, newest first.
 */
export async function listBackups(): Promise<Backup[]> {
  const root = getBackupRoot()
  const results: Backup[] = []

  let profileDirs: Awaited<ReturnType<typeof readdir>>
  try {
    profileDirs = (await readdir(root, { withFileTypes: true })).filter(e => e.isDirectory())
  } catch {
    return []
  }

  await Promise.all(profileDirs.map(async profileDir => {
    const profileName = profileDir.name
    const profileBackupPath = join(root, profileName)

    try {
      const entries = await readdir(profileBackupPath, { withFileTypes: true })
      const backups = await Promise.all([
        // Folder backups — subdirectories
        ...entries
          .filter(e => e.isDirectory())
          .map(async e => {
            const backupPath = join(profileBackupPath, e.name)
            const files = await readdir(backupPath)
            const s = await stat(backupPath)
            return {
              type: 'folder' as const,
              name: e.name,
              profileName,
              path: backupPath,
              createdAt: s.birthtimeMs,
              fileCount: files.filter(f => f.endsWith('.dat')).length,
            }
          }),
        // File backups — .dat files in the profile dir
        ...await (async () => {
          const meta = await readMeta(profileBackupPath)
          return entries
            .filter(e => e.isFile() && e.name.endsWith('.dat'))
            .map(async e => {
              const filePath = join(profileBackupPath, e.name)
              const name = e.name.replace(/\.dat$/, '')
              const s = await stat(filePath)
              return {
                type: 'file' as const,
                name,
                profileName,
                displayName: meta[name],
                path: filePath,
                createdAt: s.birthtimeMs,
                fileCount: 1,
              }
            })
        })(),
      ])
      results.push(...backups)
    } catch { /* profile backup dir unreadable */ }
  }))

  return results.sort((a, b) => b.createdAt - a.createdAt)
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
  const profileBackupPath = backupFilePath.substring(0, backupFilePath.lastIndexOf('/'))
  const name = basename(backupFilePath).replace(/\.dat$/, '')
  await removeMeta(profileBackupPath, name)
}
