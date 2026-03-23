import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Profile } from '../types'
import { useServerStore } from './useServerStore'

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([])
  const activeProfile = ref<Profile | null>(null)
  const loading = ref(false)

  async function loadProfiles() {
    const serverStore = useServerStore()
    if (!serverStore.activeServer) return
    loading.value = true
    try {
      profiles.value = await window.ipcRenderer.invoke('profile:list', serverStore.activeServer.path)
      // Restore last-used profile
      const saved = await window.ipcRenderer.invoke('store:get-server-profile', serverStore.activeServer.name)
      const match = profiles.value.find(p => p.name === saved) ?? profiles.value[0] ?? null
      activeProfile.value = match
    } finally {
      loading.value = false
    }
  }

  async function selectProfile(profile: Profile) {
    const serverStore = useServerStore()
    activeProfile.value = profile
    if (serverStore.activeServer) {
      await window.ipcRenderer.invoke('store:set-server-profile', serverStore.activeServer.name, profile.name)
    }
  }

  async function createProfile(name: string) {
    const serverStore = useServerStore()
    if (!serverStore.activeServer) return
    await window.ipcRenderer.invoke('profile:create', serverStore.activeServer.path, name)
    await loadProfiles()
  }

  async function renameProfile(oldName: string, newName: string) {
    const serverStore = useServerStore()
    if (!serverStore.activeServer) return
    await window.ipcRenderer.invoke('profile:rename', serverStore.activeServer.path, oldName, newName)
    await loadProfiles()
  }

  async function duplicateProfile(sourceName: string, newName: string) {
    const serverStore = useServerStore()
    if (!serverStore.activeServer) return
    await window.ipcRenderer.invoke('profile:duplicate', serverStore.activeServer.path, sourceName, newName)
    await loadProfiles()
  }

  async function deleteProfile(name: string) {
    const serverStore = useServerStore()
    if (!serverStore.activeServer) return
    await window.ipcRenderer.invoke('profile:delete', serverStore.activeServer.path, name)
    if (activeProfile.value?.name === name) activeProfile.value = null
    await loadProfiles()
  }

  return {
    profiles, activeProfile, loading,
    loadProfiles, selectProfile, createProfile, renameProfile, duplicateProfile, deleteProfile,
  }
})
