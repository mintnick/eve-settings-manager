import { describe, it, expect } from 'vitest'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { detectServers, inferEsiServer } from '../server.js'

// server.ts has no Electron imports — no mocking needed.

const EVE_TEST = join(homedir(), 'Library', 'Application Support', 'CCP', 'EVE_test')

// ── inferEsiServer ────────────────────────────────────────────────────────────

describe('inferEsiServer', () => {
  it('maps tranquility dir name to tq', () => {
    expect(inferEsiServer('_c_tranquility')).toBe('tq')
  })

  it('maps serenity dir name to serenity', () => {
    expect(inferEsiServer('_c_serenity')).toBe('serenity')
  })

  it('maps infinity dir name to infinity', () => {
    expect(inferEsiServer('_c_infinity')).toBe('infinity')
  })

  it('maps singularity dir name to singularity', () => {
    expect(inferEsiServer('_c_singularity')).toBe('singularity')
  })

  it('maps duality and buckshot dir names to other', () => {
    expect(inferEsiServer('_c_duality')).toBe('other')
    expect(inferEsiServer('_c_buckshot')).toBe('other')
  })

  it('defaults to tq for unknown dir names', () => {
    expect(inferEsiServer('unknowndirname')).toBe('tq')
  })

  it('is case-insensitive', () => {
    expect(inferEsiServer('_C_SERENITY')).toBe('serenity')
    expect(inferEsiServer('_C_INFINITY')).toBe('infinity')
  })
})

// ── detectServers ─────────────────────────────────────────────────────────────

describe('detectServers', () => {
  it('returns only directories matching known server keywords', async () => {
    const servers = await detectServers(EVE_TEST)
    const names = servers.map(s => s.name)
    expect(names).toContain('_test_tranquility')
    expect(names).toContain('_test_serenity')
  })

  it('returns absolute paths', async () => {
    const servers = await detectServers(EVE_TEST)
    for (const s of servers) {
      expect(s.path).toBe(join(EVE_TEST, s.name))
    }
  })

  it('returns results sorted alphabetically by name', async () => {
    const servers = await detectServers(EVE_TEST)
    const names = servers.map(s => s.name)
    expect(names).toEqual([...names].sort())
  })

  it('includes a display name', async () => {
    const servers = await detectServers(EVE_TEST)
    for (const s of servers) {
      expect(typeof s.displayName).toBe('string')
      expect(s.displayName.length).toBeGreaterThan(0)
    }
  })

  it('display name for tranquility contains "Tranquility"', async () => {
    const servers = await detectServers(EVE_TEST)
    const tq = servers.find(s => s.name === '_test_tranquility')
    expect(tq?.displayName).toContain('Tranquility')
  })

  it('returns empty array for a directory with no server subdirs', async () => {
    // Use a leaf profile dir — contains no server-named subdirs.
    const profilePath = join(EVE_TEST, '_test_tranquility', 'settings_Default')
    const servers = await detectServers(profilePath)
    expect(servers).toEqual([])
  })
})
