import { readdir, stat, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { request } from 'node:https'
import type { SettingsFile, EsiServer } from './types.js'
import { getCachedCharNames, setCachedCharNames } from './store.js'

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

/** POST JSON via Node.js https (bypasses Chromium network stack). */
function httpsPost(url: string, body: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const parsed = new URL(url)
    const req = request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          return reject(new Error(`HTTP ${res.statusCode}`))
        }
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end', () => { try { resolve(JSON.parse(data)) } catch (e) { reject(e) } })
      },
    )
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    req.write(payload)
    req.end()
  })
}

/**
 * Resolves character IDs to names. Checks local cache first; only fetches
 * uncached IDs from ESI, then saves new results back to cache.
 * Returns a map of id → name for all IDs that could be resolved.
 */
export async function resolveCharNames(
  ids: string[],
  server: EsiServer,
): Promise<Record<string, string>> {
  if (ids.length === 0) return {}

  const cache = getCachedCharNames()
  const cached: Record<string, string> = {}
  const uncachedIds: string[] = []

  for (const id of ids) {
    if (cache[id]) {
      cached[id] = cache[id]
    } else {
      uncachedIds.push(id)
    }
  }

  if (uncachedIds.length === 0) return cached

  let url: string
  if (server === 'tq') {
    url = 'https://esi.evetech.net/universe/names/'
  } else if (server === 'serenity') {
    url = 'https://ali-esi.evepc.163.com/latest/universe/names/?datasource=serenity'
  } else {
    url = 'https://ali-esi.evepc.163.com/latest/universe/names/?datasource=infinity'
  }

  try {
    const data = await httpsPost(url, uncachedIds.map(Number)) as Array<{ id: number; name: string; category: string }>
    const fetched = Object.fromEntries(
      data
        .filter(e => e.category === 'character')
        .map(e => [String(e.id), e.name]),
    )
    setCachedCharNames(fetched)
    return { ...cached, ...fetched }
  } catch {
    return cached
  }
}

/**
 * Copies a single .dat file to one or more destination paths (overwrite).
 */
export async function copySettings(srcPath: string, destPaths: string[]): Promise<void> {
  await Promise.all(destPaths.map(dest => copyFile(srcPath, dest)))
}
