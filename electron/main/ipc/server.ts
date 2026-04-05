import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { ServerDir, ServerStatus, EsiServer } from './types.js'
import { httpsGet } from './http.js'

const SERVER_KEYWORDS: [string, string][] = [
  ['tranquil',   'Tranquility'],
  ['serenity',   'Serenity'],
  ['infinity',   'Infinity'],
  ['singulari',  'Singularity'],
  ['duality',    'Duality'],
  ['thunderdome','Thunderdome'],
  ['buckshot',   'Thunderdome'],  // CCP's internal folder name for the tournament server
  ['tornado',    'Tornado'],      // Temporary China tournament server
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
  // Singularity, Duality, Thunderdome and its folder alias buckshot have no
  // public ESI (Singularity's datasource was removed January 2020).
  if (lower.includes('singulari') || lower.includes('duality')
    || lower.includes('thunderdome') || lower.includes('buckshot')
    || lower.includes('tornado')) return 'other'
  return 'tq'
}

/**
 * Fetches live server status from ESI.
 */
export async function getServerStatus(server: EsiServer): Promise<ServerStatus> {
  // 'other' covers Singularity, Duality, Thunderdome — none have a public ESI endpoint.
  if (server === 'other') return { online: false }
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
