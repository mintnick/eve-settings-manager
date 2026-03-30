<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
  DocumentCopy,
  RefreshLeft,
} from '@element-plus/icons-vue'

const { t, locale } = useI18n()

const serverStore = useServerStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()
const backupStore = useBackupStore()

const fixturePath = import.meta.env.VITE_FIXTURE_PATH as string | undefined

onMounted(() => {
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

function revealBackup(path: string) {
  window.ipcRenderer.invoke('folder:show-in-shell', path)
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

const LANGUAGES = [
  { value: 'en',     label: 'English' },
  { value: 'zh-CN',  label: '简体中文' },
  { value: 'zh-CHT', label: '繁體中文' },
  { value: 'ja',     label: '日本語' },
  { value: 'ko',     label: '한국어' },
  { value: 'fr',     label: 'Français' },
  { value: 'de',     label: 'Deutsch' },
  { value: 'es',     label: 'Español' },
]

const language = ref('en')

onMounted(async () => {
  const saved = await window.ipcRenderer.invoke('store:get-language') || 'en'
  language.value = saved
  locale.value = saved
})

async function setLanguage(lang: string) {
  language.value = lang
  locale.value = lang
  await window.ipcRenderer.invoke('store:set-language', lang)
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
      <p class="empty-title">{{ t('emptyState.title') }}</p>
      <p class="empty-sub">{{ t('emptyState.sub') }}</p>
      <el-button type="primary" @click="serverStore.openFolderDialog()">{{ t('emptyState.selectFolder') }}</el-button>
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
          <div class="sidebar-label">{{ t('sidebar.servers') }}</div>
          <div
            v-for="server in serverStore.servers"
            :key="server.path"
            class="sidebar-item"
            :class="{ active: serverStore.activeServer?.path === server.path }"
            @click="serverStore.selectServer(server)"
          >
            {{ server.displayName }}
          </div>
          <div class="sidebar-folder-btn-wrap">
            <button class="sidebar-folder-btn" @click="serverStore.openFolderDialog()">
              <el-icon><FolderOpened /></el-icon> {{ t('sidebar.setFolder') }}
            </button>
            <button class="sidebar-folder-btn" @click="serverStore.resetFolder(fixturePath)">
              <el-icon><RefreshLeft /></el-icon> {{ t('sidebar.defaultPath') }}
            </button>
          </div>
        </div>

        <div class="sidebar-divider" />

        <div class="sidebar-section">
          <div class="sidebar-label">{{ t('sidebar.backups') }}</div>
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
              <span class="backup-meta">{{ backup.type === 'file' ? t('sidebar.singleFile') : t('sidebar.files', { n: backup.fileCount }) }}</span>
            </div>
            <el-icon class="backup-reveal-btn" @click.stop="revealBackup(backup.path)">
              <FolderOpened />
            </el-icon>
          </div>
          <div v-if="!backupStore.backups.length && profileStore.activeProfile" class="sidebar-item sidebar-empty">
            {{ t('sidebar.noBackups') }}
          </div>
        </div>

        <!-- Language selector -->
        <div class="sidebar-lang">
          <el-select
            :model-value="language"
            size="small"
            @change="setLanguage"
          >
            <el-option
              v-for="lang in LANGUAGES"
              :key="lang.value"
              :value="lang.value"
              :label="lang.label"
            />
          </el-select>
        </div>
      </aside>

      <!-- Right panel -->
      <div class="right-panel">

        <!-- Profile tabs -->
        <div v-if="profileStore.profiles.length" class="profile-tabs-row">
          <span class="profile-tabs-label">{{ t('table.profilesLabel') }}</span>
          <el-tabs
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
        </div>

        <!-- Loading -->
        <div v-if="settingsStore.loading" class="empty-state flex-1">
          <el-icon :size="32" class="loading-spin"><Files /></el-icon>
        </div>

        <!-- Tables -->
        <div v-else class="tables-row">

          <!-- Characters -->
          <div class="table-col">
            <div class="table-label">{{ t('table.characters') }}</div>
            <el-table
              :data="settingsStore.charFiles"
              size="small"
              :empty-text="profileStore.activeProfile ? t('table.noCharFiles') : t('table.selectProfile')"
              class="settings-table"
            >
              <el-table-column prop="charName" :label="t('table.colCharacter')" sortable>
                <template #default="{ row }">{{ row.charName ?? row.id }}</template>
              </el-table-column>
              <el-table-column prop="id" :label="t('table.colId')" />
              <el-table-column prop="modifiedAt" :label="t('table.colModified')" sortable>
                <template #default="{ row }">{{ formatDate(row.modifiedAt) }}</template>
              </el-table-column>
              <el-table-column width="40">
                <template #default="{ row }">
                  <el-tooltip :content="t('table.backupFile')" placement="top">
                    <el-icon class="backup-icon" @click.stop="openFileBackupDialog(row)"><DocumentCopy /></el-icon>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="table-divider" />

          <!-- Accounts -->
          <div class="table-col">
            <div class="table-label">{{ t('table.accounts') }}</div>
            <el-table
              :data="settingsStore.userFiles"
              size="small"
              :empty-text="profileStore.activeProfile ? t('table.noAccountFiles') : t('table.selectProfile')"
              class="settings-table"
            >
              <el-table-column prop="id" :label="t('table.colAccountId')" sortable />
              <el-table-column prop="modifiedAt" :label="t('table.colModified')" sortable>
                <template #default="{ row }">{{ formatDate(row.modifiedAt) }}</template>
              </el-table-column>
              <el-table-column width="40">
                <template #default="{ row }">
                  <el-tooltip :content="t('table.backupFile')" placement="top">
                    <el-icon class="backup-icon" @click.stop="openFileBackupDialog(row)"><DocumentCopy /></el-icon>
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
            {{ t('actions.copySettings') }}
          </el-button>
          <el-button :disabled="!profileStore.activeProfile" @click="openBackupDialog()">
            <el-icon class="mr-1"><Box /></el-icon>
            {{ t('actions.backup') }}
          </el-button>
          <el-button :disabled="!serverStore.activeServer" @click="openServerFolder()">
            <el-icon class="mr-1"><FolderOpened /></el-icon>
            {{ t('actions.openFolder') }}
          </el-button>
        </div>

      </div>
    </div>

    <!-- Backup name dialog -->
    <el-dialog v-model="backupDialog" :title="t('dialog.saveBackup')" width="400px" @keydown.enter="confirmBackup">
      <el-input v-model="backupName" :placeholder="t('dialog.backupName')" autofocus />
      <template #footer>
        <el-button @click="backupDialog = false">{{ t('dialog.cancel') }}</el-button>
        <el-button type="primary" :disabled="!backupName.trim()" @click="confirmBackup">{{ t('dialog.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- Single file backup dialog -->
    <el-dialog v-model="fileBackupDialog" :title="t('dialog.backupFile')" width="400px" @keydown.enter="confirmFileBackup">
      <el-input v-model="fileBackupName" :placeholder="t('dialog.backupName')" autofocus />
      <template #footer>
        <el-button @click="fileBackupDialog = false">{{ t('dialog.cancel') }}</el-button>
        <el-button type="primary" :disabled="!fileBackupName.trim()" @click="confirmFileBackup">{{ t('dialog.save') }}</el-button>
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
  display: flex;
  flex-direction: column;
}
.sidebar-lang {
  margin-top: auto;
  padding: 10px 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.sidebar-lang .el-select { width: 100%; }
.sidebar-section { padding: 0 4px; }
.sidebar-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-color-success);
  letter-spacing: 0.02em;
  padding: 10px 10px 4px;
  text-align: center;
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
.sidebar-folder-btn-wrap { padding: 6px 10px; display: flex; flex-direction: column; gap: 6px; }
.sidebar-folder-btn {
  width: 100%;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  background: transparent;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
}
.sidebar-folder-btn:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.sidebar-item-icon { font-size: 15px; }
.sidebar-empty { color: var(--el-text-color-placeholder); font-size: 14px; cursor: default; }
.sidebar-empty:hover { background: none; }
.sidebar-divider { margin: 8px 0; border-top: 1px solid var(--el-border-color-lighter); }
.backup-item { align-items: flex-start; }
.backup-reveal-btn {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  opacity: 0;
  cursor: pointer;
  font-size: 14px !important;
  padding-top: 2px;
}
.backup-item:hover .backup-reveal-btn { opacity: 1; }
.backup-reveal-btn:hover { color: var(--el-color-primary); }
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
.profile-tabs-row {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
}
.profile-tabs-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--el-text-color-placeholder);
  margin-right: 10px;
  white-space: nowrap;
}
.profile-tabs {
  flex: 1;
  min-width: 0;
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
.action-bar .el-button {
  min-width: 130px;
  white-space: nowrap;
}

/* Backup icon */
.backup-icon {
  color: var(--el-color-primary-light-3);
  cursor: pointer;
  opacity: 0.7;
  font-size: 16px !important;
}
.backup-icon:hover { color: var(--el-text-color-primary); opacity: 1; }

/* Misc */
.loading-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.mr-1 { margin-right: 4px; }
.flex-1 { flex: 1; }
</style>
