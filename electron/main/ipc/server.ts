import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { request } from 'node:https'
import type { ServerDir, ServerStatus, EsiServer } from './types.js'

const SERVER_KEYWORDS: [string, string][] = [
  ['tranquil', 'Tranquility'],
  ['serenity',  'Serenity'],
  ['infinity',  'Infinity'],
  ['singulari', 'Singularity'],
  ['duality',   'Duality'],
  ['buckshot',  'Buckshot'],
]

const LANG_NAMES: Record<string, string> = {
  en: 'English', de: 'German', fr: 'French', ru: 'Russian',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', es: 'Spanish',
  it: 'Italian', pt: 'Portuguese',
}

function serverDisplayName(dirName: string): string {
  const lower = dirName.toLowerCase()

  let server = dirName  // fallback to raw name
  for (const [keyword, label] of SERVER_KEYWORDS) {
    if (lower.includes(keyword)) { server = label; break }
  }

  const langMatch = /[_-]([a-z]{2})$/i.exec(lower)
  if (langMatch && LANG_NAMES[langMatch[1]]) {
    return `${server} (${LANG_NAMES[langMatch[1]]})`
  }

  return server
}

/**
 * Scans the EVE folder for server sub-directories (e.g. _c_tranquility).
 */
export async function detectServers(eveFolder: string): Promise<ServerDir[]> {
  const entries = await readdir(eveFolder, { withFileTypes: true })
  return entries
    .filter(e => e.isDirectory() && SERVER_KEYWORDS.some(([kw]) => e.name.toLowerCase().includes(kw)))
    .map(e => ({ name: e.name, path: join(eveFolder, e.name), displayName: serverDisplayName(e.name) }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Maps a server directory name to the ESI server enum value.
 * Heuristic: checks for known keywords in the dir name.
 */
export function inferEsiServer(serverDirName: string): EsiServer {
  const lower = serverDirName.toLowerCase()
  if (lower.includes('serenity')) return 'serenity'
  if (lower.includes('infinity')) return 'infinity'
  return 'tq'
}

/** GET via Node.js https. Resolves with parsed JSON or rejects on error/non-200. */
function httpsGet(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = request(url, { timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch (e) { reject(e) } })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    req.end()
  })
}

/**
 * Fetches live server status from ESI.
 */
export async function getServerStatus(server: EsiServer): Promise<ServerStatus> {
  try {
    let url: string
    if (server === 'tq') {
      url = 'https://esi.evetech.net/status/'
    } else if (server === 'serenity') {
      url = 'https://ali-esi.evepc.163.com/latest/status/?datasource=serenity'
    } else {
      url = 'https://ali-esi.evepc.163.com/latest/status/?datasource=infinity'
    }
    await httpsGet(url)
    return { online: true }
  } catch {
    return { online: false }
  }
}
