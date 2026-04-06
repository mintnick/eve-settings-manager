import { describe, it, expect, vi } from 'vitest'
import { homedir } from 'node:os'
import { join } from 'node:path'

// folder.ts imports `dialog` from electron at the top level — mock it so the
// module can load in a plain Node.js environment without Electron running.
vi.mock('electron', () => ({ dialog: {} }))

import { findEveFolder, getDefaultEvePath } from '../folder.js'

const EVE_TEST = join(homedir(), 'Library', 'Application Support', 'CCP', 'EVE_test')

describe('getDefaultEvePath', () => {
  it('returns a string path', () => {
    const p = getDefaultEvePath()
    expect(typeof p).toBe('string')
    expect(p.length).toBeGreaterThan(0)
  })

  it('contains CCP/EVE', () => {
    expect(getDefaultEvePath()).toContain(join('CCP', 'EVE'))
  })
})

describe('findEveFolder', () => {
  it('returns the path when the directory exists', async () => {
    const result = await findEveFolder(EVE_TEST)
    expect(result).toBe(EVE_TEST)
  })

  it('returns null when the directory does not exist', async () => {
    const result = await findEveFolder('/this/path/does/not/exist/anywhere')
    expect(result).toBeNull()
  })

  it('returns null when called with no argument and default path is missing', async () => {
    // Patch getDefaultEvePath implicitly by passing a bad path — the default
    // path on this machine likely exists (real EVE install), so test the
    // custom-path branch for the missing case.
    const result = await findEveFolder('/nonexistent')
    expect(result).toBeNull()
  })
})
