import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { writeFile, unlink, readFile } from 'node:fs/promises'

// settings.ts pulls in store.ts which uses electron-store — mock those two
// functions so the module loads without Electron.
vi.mock('../store.js', () => ({
  getCachedCharNames: vi.fn(() => ({})),
  setCachedCharNames: vi.fn(),
}))

import { listSettings, copySettings } from '../settings.js'

const TQ_DEFAULT = join(
  homedir(), 'Library', 'Application Support', 'CCP', 'EVE_test',
  '_test_tranquility', 'settings_Default',
)
const TQ_CUSTOM = join(
  homedir(), 'Library', 'Application Support', 'CCP', 'EVE_test',
  '_test_tranquility', 'settings_Custom',
)

// ── listSettings ──────────────────────────────────────────────────────────────

describe('listSettings — Default profile (8 char + 6 user)', () => {
  it('returns 14 files total', async () => {
    const files = await listSettings(TQ_DEFAULT)
    expect(files).toHaveLength(14)
  })

  it('returns 8 char files', async () => {
    const files = await listSettings(TQ_DEFAULT)
    expect(files.filter(f => f.type === 'char')).toHaveLength(8)
  })

  it('returns 6 user files', async () => {
    const files = await listSettings(TQ_DEFAULT)
    expect(files.filter(f => f.type === 'user')).toHaveLength(6)
  })

  it('each file has a numeric id', async () => {
    const files = await listSettings(TQ_DEFAULT)
    for (const f of files) {
      expect(f.id).toMatch(/^\d+$/)
    }
  })

  it('each file has an absolute path', async () => {
    const files = await listSettings(TQ_DEFAULT)
    for (const f of files) {
      expect(f.path).toBe(join(TQ_DEFAULT, f.filename))
    }
  })

  it('each file has a modifiedAt timestamp', async () => {
    const files = await listSettings(TQ_DEFAULT)
    for (const f of files) {
      expect(typeof f.modifiedAt).toBe('number')
      expect(f.modifiedAt).toBeGreaterThan(0)
    }
  })
})

describe('listSettings — Custom profile (3 char + 2 user)', () => {
  it('returns 5 files total', async () => {
    const files = await listSettings(TQ_CUSTOM)
    expect(files).toHaveLength(5)
  })

  it('returns 3 char files', async () => {
    const files = await listSettings(TQ_CUSTOM)
    expect(files.filter(f => f.type === 'char')).toHaveLength(3)
  })

  it('returns 2 user files', async () => {
    const files = await listSettings(TQ_CUSTOM)
    expect(files.filter(f => f.type === 'user')).toHaveLength(2)
  })
})

describe('listSettings — filename filtering', () => {
  it('ignores non-.dat files and unrelated filenames', async () => {
    // Both profiles contain only core_char/core_user .dat files — no extras
    // in fixtures. Verify none of the returned filenames break the pattern.
    const files = await listSettings(TQ_DEFAULT)
    for (const f of files) {
      expect(f.filename).toMatch(/^core_(char|user)_\d+\.dat$/)
    }
  })
})

// ── copySettings ──────────────────────────────────────────────────────────────

describe('copySettings', () => {
  const MAGIC = Buffer.from([0xcc, 0x50, 0x78, 0x01])
  const srcFile = join(TQ_DEFAULT, '_test_copy_src.dat')
  const dest1   = join(TQ_DEFAULT, '_test_copy_dest1.dat')
  const dest2   = join(TQ_DEFAULT, '_test_copy_dest2.dat')

  beforeEach(async () => {
    await writeFile(srcFile, Buffer.concat([MAGIC, Buffer.from('copy-test-source')]))
  })

  afterEach(async () => {
    await Promise.all([
      unlink(srcFile).catch(() => {}),
      unlink(dest1).catch(() => {}),
      unlink(dest2).catch(() => {}),
    ])
  })

  it('copies a file to a single destination', async () => {
    await copySettings(srcFile, [dest1])
    const content = await readFile(dest1)
    expect(content).toEqual(await readFile(srcFile))
  })

  it('copies a file to multiple destinations', async () => {
    await copySettings(srcFile, [dest1, dest2])
    const srcContent = await readFile(srcFile)
    expect(await readFile(dest1)).toEqual(srcContent)
    expect(await readFile(dest2)).toEqual(srcContent)
  })

  it('copied file starts with the magic header', async () => {
    await copySettings(srcFile, [dest1])
    const content = await readFile(dest1)
    expect(content.slice(0, 4)).toEqual(MAGIC)
  })

  it('does nothing when destinations list is empty', async () => {
    await expect(copySettings(srcFile, [])).resolves.toBeUndefined()
  })
})
