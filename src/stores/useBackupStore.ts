import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Backup } from '../types'
import { useProfileStore } from './useProfileStore'

export const useBackupStore = defineStore('backup', () => {
  const backups = ref<Backup[]>([])
  const loading = ref(false)

  async function loadBackups() {
    const profileStore = useProfileStore()
    if (!profileStore.activeProfile) return
    loading.value = true
    try {
      backups.value = await window.ipcRenderer.invoke('backup:list', profileStore.activeProfile.path)
    } finally {
      loading.value = false
    }
  }

  async function createBackup(name: string) {
    const profileStore = useProfileStore()
    if (!profileStore.activeProfile) return
    await window.ipcRenderer.invoke('backup:create', profileStore.activeProfile.path, name)
    await loadBackups()
  }

  async function restoreBackup(backupName: string) {
    const profileStore = useProfileStore()
    if (!profileStore.activeProfile) return
    await window.ipcRenderer.invoke('backup:restore', profileStore.activeProfile.path, backupName)
  }

  async function deleteBackup(backupName: string) {
    const profileStore = useProfileStore()
    if (!profileStore.activeProfile) return
    await window.ipcRenderer.invoke('backup:delete', profileStore.activeProfile.path, backupName)
    await loadBackups()
  }

  return {
    backups, loading,
    loadBackups, createBackup, restoreBackup, deleteBackup,
  }
})
