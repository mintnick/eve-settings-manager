import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServerDir, ServerStatus, EsiServer } from '../types'

export const useServerStore = defineStore('server', () => {
  const eveFolder = ref<string | null>(null)
  const servers = ref<ServerDir[]>([])
  const activeServer = ref<ServerDir | null>(null)
  const serverStatus = ref<ServerStatus | null>(null)
  const loadingFolder = ref(false)
  const loadingStatus = ref(false)

  const hasFolder = computed(() => !!eveFolder.value)
  const activeServerName = computed(() => activeServer.value?.name ?? null)

  async function detectFolder(customPath?: string) {
    loadingFolder.value = true
    try {
      // Saved user override takes priority, then dev fixture path, then OS default
      const savedFolder: string = await window.ipcRenderer.invoke('store:get-custom-folder')
      const folder = await window.ipcRenderer.invoke('folder:find', savedFolder || customPath || undefined)
      eveFolder.value = folder ?? null
      if (folder) await detectServers()
    } finally {
      loadingFolder.value = false
    }
  }

  async function openFolderDialog() {
    const selected = await window.ipcRenderer.invoke('folder:open-dialog')
    if (!selected) return
    const { gameFolder, serverFolder } = await window.ipcRenderer.invoke('folder:resolve-game-folder', selected)
    eveFolder.value = gameFolder
    activeServer.value = null
    await window.ipcRenderer.invoke('store:set-custom-folder', gameFolder)
    await detectServers()
    // If user selected a server folder directly, override the auto-selection
    if (serverFolder) {
      const match = servers.value.find(s => s.path === serverFolder)
      if (match) await selectServer(match)
    }
  }

  async function resetFolder(fallbackPath?: string) {
    activeServer.value = null
    await window.ipcRenderer.invoke('store:set-custom-folder', '')
    await detectFolder(fallbackPath)
  }

  async function detectServers() {
    if (!eveFolder.value) return
    servers.value = await window.ipcRenderer.invoke('server:detect', eveFolder.value)

    // No recognised server sub-dirs — treat the folder itself as the server so
    // profile operations (create, list) have a valid path to work with.
    if (!servers.value.length) {
      activeServer.value = { name: '', path: eveFolder.value, displayName: '' }
      return
    }

    if (activeServer.value) return

    // Restore last-selected server, or prefer a TQ-like server over others
    const lastName: string = await window.ipcRenderer.invoke('store:get-last-server')
    const byName = servers.value.find(s => s.name === lastName)
    const tqLike = servers.value.find(s => s.name.toLowerCase().includes('tranquil'))
    activeServer.value = byName ?? tqLike ?? servers.value[0]
  }

  async function selectServer(server: ServerDir) {
    activeServer.value = server
    serverStatus.value = null
    await window.ipcRenderer.invoke('store:set-last-server', server.name)
  }

  async function refreshStatus() {
    if (!activeServer.value?.name) return
    loadingStatus.value = true
    try {
      const esiServer: EsiServer = await window.ipcRenderer.invoke('server:infer-esi', activeServer.value.name)
      serverStatus.value = await window.ipcRenderer.invoke('server:status', esiServer)
    } finally {
      loadingStatus.value = false
    }
  }

  return {
    eveFolder, servers, activeServer, serverStatus,
    loadingFolder, loadingStatus, hasFolder, activeServerName,
    detectFolder, openFolderDialog, resetFolder, detectServers, selectServer, refreshStatus,
  }
})
