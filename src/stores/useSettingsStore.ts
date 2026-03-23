import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CharFile, UserFile, EsiServer } from '../types'
import { useProfileStore } from './useProfileStore'
import { useServerStore } from './useServerStore'

export const useSettingsStore = defineStore('settings', () => {
  const charFiles = ref<CharFile[]>([])
  const userFiles = ref<UserFile[]>([])
  const loading = ref(false)
  const descriptions = ref<Record<string, string>>({})

  async function loadSettings() {
    const profileStore = useProfileStore()
    const serverStore = useServerStore()
    if (!profileStore.activeProfile) return
    loading.value = true
    try {
      const files = await window.ipcRenderer.invoke('settings:list', profileStore.activeProfile.path)
      charFiles.value = files.filter((f: CharFile | UserFile) => f.type === 'char')
      userFiles.value = files.filter((f: CharFile | UserFile) => f.type === 'user')

      // Resolve char names (returns Record<id, name>, cached locally in main process)
      if (charFiles.value.length && serverStore.activeServer) {
        const esiServer: EsiServer = await window.ipcRenderer.invoke('server:infer-esi', serverStore.activeServer.name)
        const ids = charFiles.value.map(f => f.id)
        const nameMap: Record<string, string> = await window.ipcRenderer.invoke('settings:resolve-names', ids, esiServer)
        charFiles.value = charFiles.value.map(f => ({ ...f, charName: nameMap[f.id] ?? f.charName }))
      }

      // Load descriptions
      const allFiles = [...charFiles.value, ...userFiles.value]
      for (const f of allFiles) {
        const desc = await window.ipcRenderer.invoke('store:get-description', f.filename)
        if (desc) descriptions.value[f.filename] = desc
      }
    } finally {
      loading.value = false
    }
  }

  async function copySettings(srcPath: string, destPaths: string[]) {
    await window.ipcRenderer.invoke('settings:copy', srcPath, destPaths)
    await loadSettings()
  }

  async function setDescription(filename: string, value: string) {
    await window.ipcRenderer.invoke('store:set-description', filename, value)
    descriptions.value[filename] = value
  }

  async function deleteDescription(filename: string) {
    await window.ipcRenderer.invoke('store:delete-description', filename)
    delete descriptions.value[filename]
  }

  return {
    charFiles, userFiles, loading, descriptions,
    loadSettings, copySettings, setDescription, deleteDescription,
  }
})
