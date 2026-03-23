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
      const folder = await window.ipcRenderer.invoke('folder:find', customPath)
      eveFolder.value = folder ?? null
      if (folder) await detectServers()
    } finally {
      loadingFolder.value = false
    }
  }

  async function openFolderDialog() {
    const folder = await window.ipcRenderer.invoke('folder:open-dialog')
    if (folder) {
      eveFolder.value = folder
      await detectServers()
    }
  }

  async function detectServers() {
    if (!eveFolder.value) return
    servers.value = await window.ipcRenderer.invoke('server:detect', eveFolder.value)
    if (!servers.value.length || activeServer.value) return

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
    await refreshStatus()
  }

  async function refreshStatus() {
    if (!activeServer.value) return
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
    detectFolder, openFolderDialog, detectServers, selectServer, refreshStatus,
  }
})
