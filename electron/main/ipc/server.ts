import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { ServerDir, ServerStatus, EsiServer } from './types.js'

/**
 * Scans the EVE folder for server sub-directories (e.g. _c_tranquility).
 */
export async function detectServers(eveFolder: string): Promise<ServerDir[]> {
  const entries = await readdir(eveFolder, { withFileTypes: true })
  return entries
    .filter(e => e.isDirectory())
    .map(e => ({ name: e.name, path: join(eveFolder, e.name) }))
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

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return { online: false }
    const data = await res.json() as { players: number }
    return { online: true, players: data.players }
  } catch {
    return { online: false }
  }
}
