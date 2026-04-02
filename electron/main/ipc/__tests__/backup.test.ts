import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdir, writeFile, readFile, rm, access } from 'node:fs/promises'
import {
  createBackup,
  createFileBackup,
  listBackups,
  restoreBackup,
  restoreFileBackup,
  deleteBackup,
  deleteFileBackup,
} from '../backup.js'

// backup.ts is pure Node.js — no mocking needed.

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
  await mkdir(TEMP_PROFILE, { recursive: true })
  // Seed with 3 .dat files
  await writeFile(join(TEMP_PROFILE, 'core_char_111.dat'), datContent('char_111'))
  await writeFile(join(TEMP_PROFILE, 'core_char_222.dat'), datContent('char_222'))
  await writeFile(join(TEMP_PROFILE, 'core_user_333.dat'), datContent('user_333'))
})

afterEach(async () => {
  await rm(TEMP_PROFILE, { recursive: true, force: true })
})

// ── createBackup / deleteBackup ───────────────────────────────────────────────

describe('createBackup', () => {
  it('returns a backup object with type folder', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'MyBackup')
    expect(backup.type).toBe('folder')
    expect(backup.name).toBe('MyBackup')
  })

  it('creates a subdirectory inside the profile', async () => {
    await createBackup(TEMP_PROFILE, 'MyBackup')
    expect(await exists(join(TEMP_PROFILE, 'MyBackup'))).toBe(true)
  })

  it('copies all .dat files into the backup folder', async () => {
    await createBackup(TEMP_PROFILE, 'MyBackup')
    const backupDir = join(TEMP_PROFILE, 'MyBackup')
    expect(await exists(join(backupDir, 'core_char_111.dat'))).toBe(true)
    expect(await exists(join(backupDir, 'core_char_222.dat'))).toBe(true)
    expect(await exists(join(backupDir, 'core_user_333.dat'))).toBe(true)
  })

  it('reports the correct file count', async () => {
    const backup = await createBackup(TEMP_PROFILE, 'MyBackup')
    expect(backup.fileCount).toBe(3)
  })

  it('backup files have the same content as the originals', async () => {
    await createBackup(TEMP_PROFILE, 'MyBackup')
    const original = await readFile(join(TEMP_PROFILE, 'core_char_111.dat'))
    const backed   = await readFile(join(TEMP_PROFILE, 'MyBackup', 'core_char_111.dat'))
    expect(backed).toEqual(original)
  })
})

describe('deleteBackup', () => {
  it('removes the backup folder', async () => {
    await createBackup(TEMP_PROFILE, 'ToDelete')
    await deleteBackup(TEMP_PROFILE, 'ToDelete')
    expect(await exists(join(TEMP_PROFILE, 'ToDelete'))).toBe(false)
  })

  it('does not throw if the backup does not exist', async () => {
    await expect(deleteBackup(TEMP_PROFILE, 'Nonexistent')).resolves.toBeUndefined()
  })
})

// ── restoreBackup ─────────────────────────────────────────────────────────────

describe('restoreBackup', () => {
  it('restores .dat files back into the profile', async () => {
    await createBackup(TEMP_PROFILE, 'Snap')

    // Overwrite one file with different content
    await writeFile(join(TEMP_PROFILE, 'core_char_111.dat'), datContent('MODIFIED'))

    await restoreBackup(TEMP_PROFILE, 'Snap')

    const restored = await readFile(join(TEMP_PROFILE, 'core_char_111.dat'))
    expect(restored).toEqual(datContent('char_111'))
  })

  it('restored content matches original backup bytes (magic header intact)', async () => {
    await createBackup(TEMP_PROFILE, 'Snap')
    await writeFile(join(TEMP_PROFILE, 'core_char_222.dat'), Buffer.from('garbage'))
    await restoreBackup(TEMP_PROFILE, 'Snap')
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

  it('creates the file in the Backups/ subdirectory', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createFileBackup(TEMP_PROFILE, src, 'char_111_snap')
    expect(await exists(join(TEMP_PROFILE, 'Backups', 'char_111_snap.dat'))).toBe(true)
  })

  it('backup file content matches the source', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createFileBackup(TEMP_PROFILE, src, 'char_111_snap')
    const original = await readFile(src)
    const backed   = await readFile(join(TEMP_PROFILE, 'Backups', 'char_111_snap.dat'))
    expect(backed).toEqual(original)
  })
})

describe('restoreFileBackup', () => {
  it('restores the file back into the profile directory', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createFileBackup(TEMP_PROFILE, src, 'core_char_111')

    await writeFile(src, datContent('MODIFIED'))
    await restoreFileBackup(TEMP_PROFILE, 'core_char_111')

    const restored = await readFile(src)
    expect(restored).toEqual(datContent('char_111'))
  })
})

describe('deleteFileBackup', () => {
  it('removes the backup file', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createFileBackup(TEMP_PROFILE, src, 'char_snap')
    await deleteFileBackup(TEMP_PROFILE, 'char_snap')
    expect(await exists(join(TEMP_PROFILE, 'Backups', 'char_snap.dat'))).toBe(false)
  })

  it('does not throw if the file does not exist', async () => {
    await expect(deleteFileBackup(TEMP_PROFILE, 'nonexistent')).resolves.toBeUndefined()
  })
})

// ── listBackups ───────────────────────────────────────────────────────────────

describe('listBackups', () => {
  it('returns empty array when no backups exist', async () => {
    const backups = await listBackups(TEMP_PROFILE)
    expect(backups).toEqual([])
  })

  it('lists folder backups', async () => {
    await createBackup(TEMP_PROFILE, 'FolderSnap')
    const backups = await listBackups(TEMP_PROFILE)
    const found = backups.find(b => b.name === 'FolderSnap')
    expect(found).toBeDefined()
    expect(found?.type).toBe('folder')
  })

  it('lists file backups', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createFileBackup(TEMP_PROFILE, src, 'FileSnap')
    const backups = await listBackups(TEMP_PROFILE)
    const found = backups.find(b => b.name === 'FileSnap')
    expect(found).toBeDefined()
    expect(found?.type).toBe('file')
  })

  it('lists both folder and file backups together', async () => {
    const src = join(TEMP_PROFILE, 'core_char_111.dat')
    await createBackup(TEMP_PROFILE, 'FolderSnap')
    await createFileBackup(TEMP_PROFILE, src, 'FileSnap')
    const backups = await listBackups(TEMP_PROFILE)
    const types = backups.map(b => b.type)
    expect(types).toContain('folder')
    expect(types).toContain('file')
  })

  it('returns results sorted newest first', async () => {
    await createBackup(TEMP_PROFILE, 'OlderSnap')
    // Small delay so filesystem timestamps differ
    await new Promise(r => setTimeout(r, 10))
    await createBackup(TEMP_PROFILE, 'NewerSnap')
    const backups = await listBackups(TEMP_PROFILE)
    const folderBackups = backups.filter(b => b.type === 'folder')
    expect(folderBackups[0].name).toBe('NewerSnap')
    expect(folderBackups[1].name).toBe('OlderSnap')
  })
})
