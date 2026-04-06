import { rmSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const BASE = join(homedir(), 'Library', 'Application Support', 'CCP', 'EVE_test')

// ── Fixture definition ────────────────────────────────────────────────────────
// Edit this to add/remove servers, profiles, or files.

// Real character IDs (can be resolved via ESI: https://esi.evetech.net/ui/#/Character)
// Real account/user IDs from local EVE settings
const fixtures = {
  // Mimics a real TQ installation path (shortened for test)
  _test_tranquility: {
    // Full house — all characters and accounts, for UI completeness testing
    settings_Default: {
      'core_char_2113229062.dat': 'tq|default|char_2113229062',
      'core_char_2113499532.dat': 'tq|default|char_2113499532',
      'core_char_2113631805.dat': 'tq|default|char_2113631805',
      'core_char_2114624857.dat': 'tq|default|char_2114624857',
      'core_char_2114789213.dat': 'tq|default|char_2114789213',
      'core_char_2115102847.dat': 'tq|default|char_2115102847',
      'core_char_2115234901.dat': 'tq|default|char_2115234901',
      'core_char_2115867342.dat': 'tq|default|char_2115867342',
      'core_user_15558845.dat':   'tq|default|user_15558845',
      'core_user_15559004.dat':   'tq|default|user_15559004',
      'core_user_15922853.dat':   'tq|default|user_15922853',
      'core_user_17489976.dat':   'tq|default|user_17489976',
      'core_user_16234567.dat':   'tq|default|user_16234567',
      'core_user_16890123.dat':   'tq|default|user_16890123',
    },
    // Partial — subset of chars/accounts, for diff testing
    settings_Custom: {
      'core_char_2113229062.dat': 'tq|custom|char_2113229062',
      'core_char_2113499532.dat': 'tq|custom|char_2113499532',
      'core_char_2113631805.dat': 'tq|custom|char_2113631805',
      'core_user_15922853.dat':   'tq|custom|user_15922853',
      'core_user_17489976.dat':   'tq|custom|user_17489976',
    },
    // Alt accounts only — for testing account-only profiles
    settings_AltAccounts: {
      'core_char_2115102847.dat': 'tq|altaccts|char_2115102847',
      'core_char_2115234901.dat': 'tq|altaccts|char_2115234901',
      'core_char_2115867342.dat': 'tq|altaccts|char_2115867342',
      'core_user_16234567.dat':   'tq|altaccts|user_16234567',
      'core_user_16890123.dat':   'tq|altaccts|user_16890123',
    },
  },
  // Serenity (Chinese server) — separate install, fewer accounts
  _test_serenity: {
    settings_Default: {
      'core_char_2113229062.dat': 'ser|default|char_2113229062',
      'core_char_2113499532.dat': 'ser|default|char_2113499532',
      'core_user_15922853.dat':   'ser|default|user_15922853',
      'core_user_17489976.dat':   'ser|default|user_17489976',
    },
  },
}

// ── Magic header prepended to every .dat file ─────────────────────────────────
const MAGIC = Buffer.from([0xcc, 0x50, 0x78, 0x01])

function writeDat(filePath, identifier) {
  writeFileSync(filePath, Buffer.concat([MAGIC, Buffer.from(identifier)]))
}

// ── Reset ─────────────────────────────────────────────────────────────────────
console.log(`Resetting test fixtures at:\n  ${BASE}\n`)

rmSync(BASE, { recursive: true, force: true })

for (const [serverDir, profiles] of Object.entries(fixtures)) {
  for (const [profileDir, files] of Object.entries(profiles)) {
    const dir = join(BASE, serverDir, profileDir)
    mkdirSync(dir, { recursive: true })
    for (const [filename, identifier] of Object.entries(files)) {
      writeDat(join(dir, filename), identifier)
      console.log(`  created  ${serverDir}/${profileDir}/${filename}`)
    }
  }
}

console.log('\nDone.')
