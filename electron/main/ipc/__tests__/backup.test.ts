import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdir, writeFile, readFile, rm, access } from 'node:fs/promises'

const TEST_USER_DATA = join(
  homedir(), 'Library', 'Application Support', 'CCP', 'EVE_test', '_test_userData',
)

// Mock electron's app so getBackupRoot() works outside Electron.
vi.mock('electron', () => ({
  app: { getPath: (name: string) => name === 'userData' ? TEST_USER_DATA : '/tmp' },
}))

import {
  createBackup,
  createFileBackup,
  listBackups,
  restoreBackup,
  restoreFileBackup,
  deleteBackup,
  deleteFileBackup,
} from '../backup.js'

const TQ_SERVER = join(
  homedir(), 'Library', 'Application Support', 'CCP', 'EVE_test', '_test_tranquility',
)

// We create a fresh temporary profile for each test so backup operations don't
// pollute the shared fixture profiles.
const TEMP_PROFILE = join(TQ_SERVER, 'settings__BackupTests')

const MAGIC = Buffer.from([0xcc, 0x50, 0x78, 0x01])

function datContent(label: string) {
  return Buffer.concat([MAGIC, Buffer.from(label)])
}

async function exists(p: string): Promise<boolean> {
  return access(p).then(() => true).catch(() => false)
}

beforeEach(async () => {
  await rm(TEMP_PROFILE, { recursive: true, force: true })
  await rm(TEST_USER_DATA, { recursive: true, force: true })
  await mkdir(TEMP_PROFILE, { recursive: true })
  // Seed with 3 .dat files
  await writeFile(join(TEMP_PROFILE, 'core_char_111.dat'), datContent('char_111'))
  await writeFile(join(TEMP_PROFILE, 'core_char_222.dat'), datContent('char_222'))
  await writeFile(join(TEMP_PROFILE, 'core_user_333.dat'), datContent('user_333'))
})

afterEach(async () => {
  await rm(TEMP_PROFILE, { recursive: true, force: true })
  await rm(TEST_USER_DATA, { recursive: true, force: true })
})

// ── createBackup / deleteBackup ───────────────────────────────────────────────

describe('createBackup', () => {
  it('returns a backup object with type folder', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'MyBackup')
    expect(backup.type).toBe('folder')
    expect(backup.name).toBe('MyBackup')
  })

  it('copies all .dat files into the backup folder', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'MyBackup')
    expect(await exists(join(backup.path, 'core_char_111.dat'))).toBe(true)
    expect(await exists(join(backup.path, 'core_char_222.dat'))).toBe(true)
    expect(await exists(join(backup.path, 'core_user_333.dat'))).toBe(true)
  })

  it('reports the correct file count', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'MyBackup')
    expect(backup.fileCount).toBe(3)
  })

  it('backup files have the same content as the originals', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'MyBackup')
    const original = await readFile(join(TEMP_PROFILE, 'core_char_111.dat'))
    const backed   = await readFile(join(backup.path, 'core_char_111.dat'))
    expect(backed).toEqual(original)
  })
})

describe('deleteBackup', () => {
  it('removes the backup folder', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'ToDelete')
    await deleteBackup(backup.path)
    expect(await exists(backup.path)).toBe(false)
  })

  it('does not throw if the backup does not exist', async () => {
    await expect(deleteBackup('/nonexistent/path')).resolves.toBeUndefined()
  })
})

// ── restoreBackup ─────────────────────────────────────────────────────────────

describe('restoreBackup', () => {
  it('restores .dat files back into the profile', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'Snap')

    // Overwrite one file with different content
    await writeFile(join(TEMP_PROFILE, 'core_char_111.dat'), datContent('MODIFIED'))

    await restoreBackup(TEMP_PROFILE, backup.path)

    const restored = await readFile(join(TEMP_PROFILE, 'core_char_111.dat'))
    expect(restored).toEqual(datContent('char_111'))
  })

  it('restored content matches original backup bytes (magic header intact)', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'Snap')
    await writeFile(join(TEMP_PROFILE, 'core_char_222.dat'), Buffer.from('garbage'))
    await restoreBackup(TEMP_PROFILE, backup.path)
    const content = await readFile(join(TEMP_PROFILE, 'core_char_222.dat'))
    expect(content.slice(0, 4)).toEqual(MAGIC)
  })
})

// ── createFileBackup / restoreFileBackup / deleteFileBackup ───────────────────

describe('createFileBackup', () => {
  it('returns a backup object with type file', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    const backup = await createFileBackup(TEMP_PROFILE, src, 'char_111_snap')
    expect(backup.type).toBe('file')
    expect(backup.name).toBe('char_111_snap')
  })

  it('creates the backup file at the returned path', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    const backup = await createFileBackup(TEMP_PROFILE, src, 'char_111_snap')
    expect(await exists(backup.path)).toBe(true)
  })

  it('backup file content matches the source', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    const backup = await createFileBackup(TEMP_PROFILE, src, 'char_111_snap')
    const original = await readFile(src)
    const backed   = await readFile(backup.path)
    expect(backed).toEqual(original)
  })
})

describe('restoreFileBackup', () => {
  it('restores the file back into the profile directory', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    const backup = await createFileBackup(TEMP_PROFILE, src, 'core_char_111')

    await writeFile(src, datContent('MODIFIED'))
    await restoreFileBackup(TEMP_PROFILE, backup.path)

    const restored = await readFile(src)
    expect(restored).toEqual(datContent('char_111'))
  })
})

describe('deleteFileBackup', () => {
  it('removes the backup file', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    const backup = await createFileBackup(TEMP_PROFILE, src, 'char_snap')
    await deleteFileBackup(backup.path)
    expect(await exists(backup.path)).toBe(false)
  })

  it('does not throw if the file does not exist', async () => {
    await expect(deleteFileBackup('/nonexistent/char_snap.dat')).resolves.toBeUndefined()
  })
})

// ── listBackups ───────────────────────────────────────────────────────────────

describe('listBackups', () => {
  it('returns empty array when no backups exist', async () => {
    const backups = await listBackups()
    expect(backups).toEqual([])
  })

  it('lists folder backups', async () => {
    await createBackup(TEMP_PROFILE, 'FolderSnap')
    const backups = await listBackups()
    const found = backups.find(b => b.name === 'FolderSnap')
    expect(found).toBeDefined()
    expect(found?.type).toBe('folder')
  })

  it('lists file backups', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createFileBackup(TEMP_PROFILE, src, 'FileSnap')
    const backups = await listBackups()
    const found = backups.find(b => b.name === 'FileSnap')
    expect(found).toBeDefined()
    expect(found?.type).toBe('file')
  })

  it('lists both folder and file backups together', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createBackup(TEMP_PROFILE, 'FolderSnap')
    await createFileBackup(TEMP_PROFILE, src, 'FileSnap')
    const backups = await listBackups()
    const types = backups.map(b => b.type)
    expect(types).toContain('folder')
    expect(types).toContain('file')
  })

  it('returns results sorted newest first', async () => {
    await createBackup(TEMP_PROFILE, 'OlderSnap')
    // Small delay so filesystem timestamps differ
    await new Promise(r => setTimeout(r, 10))
    await createBackup(TEMP_PROFILE, 'NewerSnap')
    const backups = await listBackups()
    const folderBackups = backups.filter(b => b.type === 'folder')
    expect(folderBackups[0].name).toBe('NewerSnap')
    expect(folderBackups[1].name).toBe('OlderSnap')
  })
})
