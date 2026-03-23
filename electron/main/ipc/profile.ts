import { readdir, mkdir, rename, rm, cp } from 'node:fs/promises'
import { join } from 'node:path'
import type { Profile } from './types.js'

function profileDir(serverPath: string, name: string): string {
  return join(serverPath, `settings_${name}`)
}

/**
 * Lists all profiles (settings_* dirs, excluding internal _backups/_saved dirs).
 */
export async function listProfiles(serverPath: string): Promise<Profile[]> {
  const entries = await readdir(serverPath, { withFileTypes: true })
  return entries
    .filter(e => e.isDirectory() && e.name.startsWith('settings_'))
    .map(e => ({ name: e.name.slice('settings_'.length), path: join(serverPath, e.name) }))
}

export async function createProfile(serverPath: string, name: string): Promise<Profile> {
  const dir = profileDir(serverPath, name)
  await mkdir(dir)
  return { name, path: dir }
}

export async function renameProfile(serverPath: string, oldName: string, newName: string): Promise<void> {
  await rename(profileDir(serverPath, oldName), profileDir(serverPath, newName))
}

/**
 * Duplicates an existing profile into a new one (copies all .dat files).
 */
export async function duplicateProfile(serverPath: string, sourceName: string, newName: string): Promise<Profile> {
  const src = profileDir(serverPath, sourceName)
  const dest = profileDir(serverPath, newName)
  await cp(src, dest, { recursive: true })
  return { name: newName, path: dest }
}

export async function deleteProfile(serverPath: string, name: string): Promise<void> {
  await rm(profileDir(serverPath, name), { recursive: true, force: true })
}
