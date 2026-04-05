import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Backup } from '../types'
import { useProfileStore } from './useProfileStore'
import { useSettingsStore } from './useSettingsStore'

export const useBackupStore = defineStore('backup', () => {
  const backups = ref<Backup[]>([])
  const loading = ref(false)

  async function loadBackups() {
    loading.value = true
    try {
      backups.value = await window.ipcRenderer.invoke('backup:list')
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

  async function createFileBackup(sourcePath: string, name: string, displayName?: string) {
    const profileStore = useProfileStore()
    if (!profileStore.activeProfile) return
    await window.ipcRenderer.invoke('backup:create-file', profileStore.activeProfile.path, sourcePath, name, displayName)
    await loadBackups()
  }

  async function restoreBackup(backup: Backup) {
    const profileStore = useProfileStore()
    if (!profileStore.activeProfile) return
    await window.ipcRenderer.invoke('backup:restore', profileStore.activeProfile.path, backup.path)
    await loadBackups()
    await useSettingsStore().loadSettings()
  }

  async function restoreFileBackup(backup: Backup) {
    const profileStore = useProfileStore()
    if (!profileStore.activeProfile) return
    await window.ipcRenderer.invoke('backup:restore-file', profileStore.activeProfile.path, backup.path)
    await loadBackups()
    await useSettingsStore().loadSettings()
  }

  async function deleteBackup(backup: Backup) {
    await window.ipcRenderer.invoke('backup:delete', backup.path)
    await loadBackups()
  }

  async function deleteFileBackup(backup: Backup) {
    await window.ipcRenderer.invoke('backup:delete-file', backup.path)
    await loadBackups()
  }

  return {
    backups, loading,
    loadBackups, createBackup, createFileBackup, restoreBackup, restoreFileBackup, deleteBackup, deleteFileBackup,
  }
})
