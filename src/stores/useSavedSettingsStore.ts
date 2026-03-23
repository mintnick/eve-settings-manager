import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SavedSnapshot } from '../types'

// IPC channels for saved snapshots are not yet implemented in the main process.
// This store is a stub — actions will be wired up in a later phase.

export const useSavedSettingsStore = defineStore('savedSettings', () => {
  const snapshots = ref<SavedSnapshot[]>([])
  const loading = ref(false)

  // TODO: implement when backup:saved-* IPC channels are added to main process

  return {
    snapshots, loading,
  }
})
