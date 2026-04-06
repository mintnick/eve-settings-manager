import { describe, it, expect, beforeEach } from 'vitest'
import { listProfiles, createProfile, renameProfile, deleteProfile } from '../profile.js'
import { join } from 'node:path'
import { homedir } from 'node:os'

// Points at the test fixtures outside the project — same path as the real EVE
// install but under EVE_test instead of EVE.
const TQ_SERVER_PATH = join(
  homedir(),
  'Library', 'Application Support', 'CCP', 'EVE_test', '_test_tranquility',
)

describe('listProfiles', () => {
  it('returns all settings_* directories', async () => {
    const profiles = await listProfiles(TQ_SERVER_PATH)
    const names = profiles.map(p => p.name)
    // Use arrayContaining so other test files running in parallel don't cause
    // false failures if they temporarily create their own settings_* directories.
    expect(names).toEqual(expect.arrayContaining(['AltAccounts', 'Custom', 'Default']))
  })

  it('returns absolute paths', async () => {
    const profiles = await listProfiles(TQ_SERVER_PATH)
    for (const p of profiles) {
      expect(p.path).toBe(join(TQ_SERVER_PATH, `settings_${p.name}`))
    }
  })
})

describe('createProfile / deleteProfile', () => {
  const testName = 'TestCreate'

  beforeEach(async () => {
    // Clean up in case a previous run left it behind
    await deleteProfile(TQ_SERVER_PATH, testName).catch(() => {})
  })

  it('creates a new profile directory and returns it', async () => {
    const profile = await createProfile(TQ_SERVER_PATH, testName)
    expect(profile.name).toBe(testName)

    const profiles = await listProfiles(TQ_SERVER_PATH)
    expect(profiles.map(p => p.name)).toContain(testName)

    await deleteProfile(TQ_SERVER_PATH, testName)
  })
})

describe('renameProfile', () => {
  const from = 'TempA'
  const to = 'TempB'

  beforeEach(async () => {
    await deleteProfile(TQ_SERVER_PATH, from).catch(() => {})
    await deleteProfile(TQ_SERVER_PATH, to).catch(() => {})
    await createProfile(TQ_SERVER_PATH, from)
  })

  it('renames the directory', async () => {
    await renameProfile(TQ_SERVER_PATH, from, to)
    const names = (await listProfiles(TQ_SERVER_PATH)).map(p => p.name)
    expect(names).not.toContain(from)
    expect(names).toContain(to)
    await deleteProfile(TQ_SERVER_PATH, to)
  })
})
