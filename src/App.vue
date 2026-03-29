<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useServerStore } from './stores/useServerStore'
import { useProfileStore } from './stores/useProfileStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useBackupStore } from './stores/useBackupStore'
import type { CharFile, UserFile, SettingsFile } from './types'
import {
  FolderOpened,
  Files,
  Folder,
  CopyDocument,
  Box,
  Warning,
} from '@element-plus/icons-vue'

const serverStore = useServerStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()
const backupStore = useBackupStore()

onMounted(() => {
  const fixturePath = import.meta.env.VITE_FIXTURE_PATH as string | undefined
  serverStore.detectFolder(fixturePath)
})

watch(() => serverStore.activeServer, async (server) => {
  if (!server) return
  await profileStore.loadProfiles()
  await serverStore.refreshStatus()
})

watch(() => profileStore.activeProfile, async (profile) => {
  if (!profile) return
  await settingsStore.loadSettings()
  await backupStore.loadBackups()
})

function formatDate(ms: number) {
  return new Date(ms).toLocaleString()
}

const backupDialog = ref(false)
const backupName = ref('')

function openBackupDialog() {
  const profile = profileStore.activeProfile?.name ?? 'profile'
  backupName.value = `${profile}_backup_${new Date().toISOString().slice(0, 10)}`
  backupDialog.value = true
}

function openServerFolder() {
  if (serverStore.activeServer)
    window.ipcRenderer.invoke('folder:open-in-shell', serverStore.activeServer.path)
}

async function confirmBackup() {
  const name = backupName.value.trim()
  if (!name) return
  backupDialog.value = false
  await backupStore.createBackup(name)
}

const fileBackupDialog = ref(false)
const fileBackupName = ref('')
const fileBackupPending = ref<SettingsFile | null>(null)

function openFileBackupDialog(file: SettingsFile) {
  fileBackupPending.value = file
  const label = file.type === 'char'
    ? ((file as CharFile).charName ?? file.id)
    : `account_${file.id}`
  fileBackupName.value = `${label}_${new Date().toISOString().slice(0, 10)}`
  fileBackupDialog.value = true
}

async function confirmFileBackup() {
  const name = fileBackupName.value.trim()
  if (!name || !fileBackupPending.value) return
  fileBackupDialog.value = false
  await backupStore.createFileBackup(fileBackupPending.value.path, name)
  fileBackupPending.value = null
}

const charColumns = [
  { prop: 'charName', label: 'Character', sortable: true },
  { prop: 'id', label: 'ID' },
  { prop: 'modifiedAt', label: 'Modified', sortable: true },
  { prop: 'backup', label: '', width: 40 },
]

const accountColumns = [
  { prop: 'id', label: 'Account ID', sortable: true },
  { prop: 'modifiedAt', label: 'Modified', sortable: true },
  { prop: 'backup', label: '', width: 40 },
]
</script>

<template>
  <div class="app-root">

    <!-- No folder found -->
    <div v-if="!serverStore.hasFolder && !serverStore.loadingFolder" class="empty-state">
      <el-icon :size="56" color="#606266"><Warning /></el-icon>
      <p class="empty-title">EVE settings folder not found</p>
      <p class="empty-sub">Make sure EVE Online is installed, or set the folder manually.</p>
      <el-button type="primary" @click="serverStore.openFolderDialog()">Select folder</el-button>
    </div>

    <!-- Loading -->
    <div v-else-if="serverStore.loadingFolder" class="empty-state">
      <el-icon :size="32" class="loading-spin"><Files /></el-icon>
    </div>

    <!-- Main layout -->
    <div v-else class="main-layout">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-label">Servers</div>
          <div
            v-for="server in serverStore.servers"
            :key="server.path"
            class="sidebar-item"
            :class="{ active: serverStore.activeServer?.path === server.path }"
            @click="serverStore.selectServer(server)"
          >
            {{ server.displayName }}
          </div>
          <div class="sidebar-item sidebar-action" @click="serverStore.openFolderDialog()">
            <el-icon class="sidebar-item-icon"><FolderOpened /></el-icon>
            {{ serverStore.eveFolder ? 'Change folder' : 'Set EVE folder' }}
          </div>
        </div>

        <div class="sidebar-divider" />

        <div class="sidebar-section">
          <div class="sidebar-label">Backups</div>
          <div
            v-for="backup in backupStore.backups"
            :key="backup.name"
            class="sidebar-item backup-item"
          >
            <el-icon class="sidebar-item-icon" color="#909399">
              <Files v-if="backup.type === 'file'" />
              <Folder v-else />
            </el-icon>
            <div class="backup-item-text">
              <span class="backup-name">{{ backup.name }}</span>
              <span class="backup-meta">{{ backup.type === 'file' ? 'single file' : `${backup.fileCount} files` }}</span>
            </div>
          </div>
          <div v-if="!backupStore.backups.length && profileStore.activeProfile" class="sidebar-item sidebar-empty">
            No backups yet
          </div>
        </div>
      </aside>

      <!-- Right panel -->
      <div class="right-panel">

        <!-- Profile tabs -->
        <el-tabs
          v-if="profileStore.profiles.length"
          :model-value="profileStore.activeProfile?.name"
          class="profile-tabs"
          @tab-click="(tab: any) => {
            const p = profileStore.profiles.find(x => x.name === tab.paneName)
            if (p) profileStore.selectProfile(p)
          }"
        >
          <el-tab-pane
            v-for="p in profileStore.profiles"
            :key="p.name"
            :label="p.name"
            :name="p.name"
          />
        </el-tabs>

        <!-- Loading -->
        <div v-if="settingsStore.loading" class="empty-state flex-1">
          <el-icon :size="32" class="loading-spin"><Files /></el-icon>
        </div>

        <!-- Tables -->
        <div v-else class="tables-row">

          <!-- Characters -->
          <div class="table-col">
            <div class="table-label">Characters</div>
            <el-table
              :data="settingsStore.charFiles"
              size="small"
              :empty-text="profileStore.activeProfile ? 'No character files found' : 'Select a profile'"
              class="settings-table"
            >
              <el-table-column prop="charName" label="Character" sortable>
                <template #default="{ row }">{{ row.charName ?? row.id }}</template>
              </el-table-column>
              <el-table-column prop="id" label="ID" />
              <el-table-column prop="modifiedAt" label="Modified" sortable>
                <template #default="{ row }">{{ formatDate(row.modifiedAt) }}</template>
              </el-table-column>
              <el-table-column width="40">
                <template #default="{ row }">
                  <el-tooltip content="Backup file" placement="top">
                    <svg viewBox="0 0 24 24" width="16" height="16" class="backup-icon" @click.stop="openFileBackupDialog(row)">
                      <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
                    </svg>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="table-divider" />

          <!-- Accounts -->
          <div class="table-col">
            <div class="table-label">Accounts</div>
            <el-table
              :data="settingsStore.userFiles"
              size="small"
              :empty-text="profileStore.activeProfile ? 'No account files found' : 'Select a profile'"
              class="settings-table"
            >
              <el-table-column prop="id" label="Account ID" sortable />
              <el-table-column prop="modifiedAt" label="Modified" sortable>
                <template #default="{ row }">{{ formatDate(row.modifiedAt) }}</template>
              </el-table-column>
              <el-table-column width="40">
                <template #default="{ row }">
                  <el-tooltip content="Backup file" placement="top">
                    <svg viewBox="0 0 24 24" width="16" height="16" class="backup-icon" @click.stop="openFileBackupDialog(row)">
                      <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
                    </svg>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- Action bar -->
        <div class="action-bar">
          <el-button :disabled="!profileStore.activeProfile">
            <el-icon class="mr-1"><CopyDocument /></el-icon>
            Copy settings
          </el-button>
          <el-button :disabled="!profileStore.activeProfile" @click="openBackupDialog()">
            <el-icon class="mr-1"><Box /></el-icon>
            Backup
          </el-button>
          <el-button :disabled="!serverStore.activeServer" @click="openServerFolder()">
            <el-icon class="mr-1"><FolderOpened /></el-icon>
            Open folder
          </el-button>
        </div>

      </div>
    </div>

    <!-- Backup name dialog -->
    <el-dialog v-model="backupDialog" title="Save backup" width="400px" @keydown.enter="confirmBackup">
      <el-input v-model="backupName" placeholder="Backup name" autofocus />
      <template #footer>
        <el-button @click="backupDialog = false">Cancel</el-button>
        <el-button type="primary" :disabled="!backupName.trim()" @click="confirmBackup">Save</el-button>
      </template>
    </el-dialog>

    <!-- Single file backup dialog -->
    <el-dialog v-model="fileBackupDialog" title="Backup file" width="400px" @keydown.enter="confirmFileBackup">
      <el-input v-model="fileBackupName" placeholder="Backup name" autofocus />
      <template #footer>
        <el-button @click="fileBackupDialog = false">Cancel</el-button>
        <el-button type="primary" :disabled="!fileBackupName.trim()" @click="confirmFileBackup">Save</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.app-root {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Empty / loading states */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
}
.empty-title { font-size: 16px; font-weight: 500; margin: 0; }
.empty-sub { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }

/* Main layout */
.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;
  padding: 8px 0;
  background: var(--el-bg-color-page);
}
.sidebar-section { padding: 0 4px; }
.sidebar-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 6px 10px 2px;
}
.sidebar-item {
  font-size: 15px;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-primary);
}
.sidebar-item:hover { background: var(--el-fill-color-light); }
.sidebar-item.active { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.sidebar-action { color: var(--el-text-color-secondary); font-size: 14px; }
.sidebar-item-icon { font-size: 15px; }
.sidebar-empty { color: var(--el-text-color-placeholder); font-size: 14px; cursor: default; }
.sidebar-empty:hover { background: none; }
.sidebar-divider { margin: 8px 0; border-top: 1px solid var(--el-border-color-lighter); }
.backup-item { align-items: flex-start; }
.backup-item-text { display: flex; flex-direction: column; }
.backup-name { font-size: 14px; line-height: 1.4; }
.backup-meta { font-size: 13px; color: var(--el-text-color-placeholder); }

/* Right panel */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.profile-tabs {
  flex-shrink: 0;
  padding: 0 12px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
}
.profile-tabs .el-tabs__header { margin: 0; }
.profile-tabs .el-tabs__nav-wrap::after { display: none; }

/* Tables */
.tables-row {
  flex: 1;
  display: flex;
  overflow: auto;
  min-height: 0;
}
.table-col { flex: 1; padding: 12px; min-width: 0; display: flex; flex-direction: column; }
.table-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.table-divider { width: 1px; background: var(--el-border-color); flex-shrink: 0; }
.settings-table { flex: 1; }

/* Action bar */
.action-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
  flex-shrink: 0;
}

/* Backup icon */
.backup-icon {
  fill: var(--el-color-primary-light-3);
  cursor: pointer;
  opacity: 0.7;
  vertical-align: middle;
  display: block;
}
.backup-icon:hover { fill: var(--el-text-color-primary); opacity: 1; }

/* Misc */
.loading-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.mr-1 { margin-right: 4px; }
.flex-1 { flex: 1; }
</style>
