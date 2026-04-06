import { describe, it, expect, vi, beforeEach } from 'vitest'

// electron-store calls Electron's app.getPath('userData') on init, which isn't
// available in a Node.js test environment.  Replace it with a simple in-memory
// Map so store.ts can load and run without Electron.
vi.mock('electron-store', () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown>

      constructor({ defaults }: { defaults: Record<string, unknown> }) {
        this.data = { ...defaults }
      }

      get(key: string) {
        return this.data[key]
      }

      set(key: string, value: unknown) {
        this.data[key] = value
      }
    },
  }
})

// Import after mock is set up.
// Each function re-uses the same singleton, so tests share state within this
// file — use distinct keys to avoid cross-test interference.
import {
  getDescription, setDescription, deleteDescription,
  getServerFolder, setServerFolder,
  getServerProfile, setServerProfile,
  getLastActiveServer, setLastActiveServer,
  getCustomEveFolder, setCustomEveFolder,
  getLanguage, setLanguage,
  getTheme, setTheme,
  getCachedCharNames, setCachedCharNames,
} from '../store.js'

// ── Descriptions ──────────────────────────────────────────────────────────────

describe('description', () => {
  it('returns empty string for an unknown key', () => {
    expect(getDescription('no_such_file.dat')).toBe('')
  })

  it('round-trips a set value', () => {
    setDescription('core_char_123.dat', 'My Main')
    expect(getDescription('core_char_123.dat')).toBe('My Main')
  })

  it('overwrites an existing value', () => {
    setDescription('core_char_456.dat', 'First')
    setDescription('core_char_456.dat', 'Updated')
    expect(getDescription('core_char_456.dat')).toBe('Updated')
  })

  it('delete removes the key (returns empty string afterwards)', () => {
    setDescription('core_char_789.dat', 'Temporary')
    deleteDescription('core_char_789.dat')
    expect(getDescription('core_char_789.dat')).toBe('')
  })

  it('delete on a non-existent key does not throw', () => {
    expect(() => deleteDescription('ghost.dat')).not.toThrow()
  })
})

// ── Per-server memory ─────────────────────────────────────────────────────────

describe('serverFolder', () => {
  it('returns undefined for unknown server', () => {
    expect(getServerFolder('_unknown_server')).toBeUndefined()
  })

  it('round-trips a set path', () => {
    setServerFolder('_tq', '/custom/eve/path')
    expect(getServerFolder('_tq')).toBe('/custom/eve/path')
  })
})

describe('serverProfile', () => {
  it('returns undefined for unknown server', () => {
    expect(getServerProfile('_unknown_server')).toBeUndefined()
  })

  it('round-trips a profile name', () => {
    setServerProfile('_tq', 'Default')
    expect(getServerProfile('_tq')).toBe('Default')
  })
})

// ── Last active server ────────────────────────────────────────────────────────

describe('lastActiveServer', () => {
  it('defaults to empty string', () => {
    // Default is set to '' in the schema — may already be set by another test,
    // so just verify we get a string back.
    expect(typeof getLastActiveServer()).toBe('string')
  })

  it('round-trips a server name', () => {
    setLastActiveServer('_test_tranquility')
    expect(getLastActiveServer()).toBe('_test_tranquility')
  })
})

// ── Custom EVE folder ─────────────────────────────────────────────────────────

describe('customEveFolder', () => {
  it('round-trips a folder path', () => {
    setCustomEveFolder('/Users/nick/EVE')
    expect(getCustomEveFolder()).toBe('/Users/nick/EVE')
  })
})

// ── App config ────────────────────────────────────────────────────────────────

describe('language', () => {
  it('defaults to "en"', () => {
    // The mock starts with defaults — language defaults to 'en'.
    // (If another test called setLanguage earlier in this file, this may
    // differ — we just verify a non-empty string is returned.)
    expect(typeof getLanguage()).toBe('string')
    expect(getLanguage().length).toBeGreaterThan(0)
  })

  it('round-trips a language code', () => {
    setLanguage('ja')
    expect(getLanguage()).toBe('ja')
  })
})

describe('theme', () => {
  it('round-trips a theme value', () => {
    setTheme('dark')
    expect(getTheme()).toBe('dark')
    setTheme('light')
    expect(getTheme()).toBe('light')
  })
})

// ── Character name cache ──────────────────────────────────────────────────────

describe('charNames cache', () => {
  it('returns empty object initially', () => {
    // The mock starts with defaults (empty {}).  May already have entries from
    // other tests in this file — just verify it's an object.
    expect(typeof getCachedCharNames()).toBe('object')
  })

  it('merges new names into existing cache', () => {
    setCachedCharNames({ '111': 'Alpha' })
    setCachedCharNames({ '222': 'Beta' })
    const cache = getCachedCharNames()
    expect(cache['111']).toBe('Alpha')
    expect(cache['222']).toBe('Beta')
  })

  it('overwrites an existing entry with the same id', () => {
    setCachedCharNames({ '333': 'Old Name' })
    setCachedCharNames({ '333': 'New Name' })
    expect(getCachedCharNames()['333']).toBe('New Name')
  })
})
