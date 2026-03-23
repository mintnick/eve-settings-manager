import { readdir, stat, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { SettingsFile, EsiServer } from './types.js'

const CHAR_RE = /^core_char_(\d+)\.dat$/
const USER_RE = /^core_user_(\d+)\.dat$/

/**
 * Lists all character and user .dat files in a profile directory.
 */
export async function listSettings(profilePath: string): Promise<SettingsFile[]> {
  const entries = await readdir(profilePath, { withFileTypes: true })
  const results: SettingsFile[] = []

  for (const e of entries) {
    if (!e.isFile()) continue
    const charMatch = CHAR_RE.exec(e.name)
    const userMatch = USER_RE.exec(e.name)
    if (!charMatch && !userMatch) continue

    const filePath = join(profilePath, e.name)
    const s = await stat(filePath)

    if (charMatch) {
      results.push({ type: 'char', id: charMatch[1], filename: e.name, path: filePath, modifiedAt: s.mtimeMs })
    } else if (userMatch) {
      results.push({ type: 'user', id: userMatch[1], filename: e.name, path: filePath, modifiedAt: s.mtimeMs })
    }
  }

  return results
}

/**
 * Resolves character IDs to names via ESI batch endpoint.
 * Returns a map of id → name; IDs that fail to resolve are omitted.
 */
export async function resolveCharNames(
  ids: string[],
  server: EsiServer,
): Promise<Record<string, string>> {
  if (ids.length === 0) return {}

  let url: string
  if (server === 'tq') {
    url = 'https://esi.evetech.net/universe/names/'
  } else if (server === 'serenity') {
    url = 'https://ali-esi.evepc.163.com/latest/universe/names/?datasource=serenity'
  } else {
    url = 'https://ali-esi.evepc.163.com/latest/universe/names/?datasource=infinity'
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids.map(Number)),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return {}
    const data = await res.json() as Array<{ id: number; name: string; category: string }>
    return Object.fromEntries(
      data
        .filter(e => e.category === 'character')
        .map(e => [String(e.id), e.name]),
    )
  } catch {
    return {}
  }
}

/**
 * Copies a single .dat file to one or more destination paths (overwrite).
 */
export async function copySettings(srcPath: string, destPaths: string[]): Promise<void> {
  await Promise.all(destPaths.map(dest => copyFile(srcPath, dest)))
}
