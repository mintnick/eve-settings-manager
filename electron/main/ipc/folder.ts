import { dialog } from 'electron'
import { homedir, platform } from 'node:os'
import { join, dirname, basename } from 'node:path'
import { access } from 'node:fs/promises'
import { SERVER_KEYWORDS } from './server.js'

export function getDefaultEvePath(): string {
  if (platform() === 'win32') {
    return join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'CCP', 'EVE')
  }
  return join(homedir(), 'Library', 'Application Support', 'CCP', 'EVE')
}

/**
 * Resolves a folder path and checks it exists. Returns the path or null if not found.
 * Pass a custom path to override the default auto-detected path.
 */
export async function findEveFolder(customPath?: string): Promise<string | null> {
  const folder = customPath ?? getDefaultEvePath()
  try {
    await access(folder)
    return folder
  } catch {
    return null
  }
}

/**
 * Given a path selected by the user, resolves the game folder and (if the user
 * selected a server sub-folder directly) the matched server folder.
 */
export function resolveGameFolder(selectedPath: string): { gameFolder: string; serverFolder: string | null } {
  const name = basename(selectedPath).toLowerCase()
  const isServerFolder = SERVER_KEYWORDS.some(([kw]) => name.includes(kw))
  if (isServerFolder) {
    return { gameFolder: dirname(selectedPath), serverFolder: selectedPath }
  }
  return { gameFolder: selectedPath, serverFolder: null }
}

/**
 * Opens a native folder picker. Returns the selected path or null if cancelled.
 */
export async function openFolderDialog(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select EVE Settings Folder',
  })
  return result.canceled ? null : result.filePaths[0]
}
