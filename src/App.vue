<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from './stores/useServerStore'
import { useProfileStore } from './stores/useProfileStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useBackupStore } from './stores/useBackupStore'
import type { CharFile, UserFile, SettingsFile, Backup } from './types'
import {
  FolderOpened,
  Files,
  Document,
  Box,
  Warning,
  DocumentCopy,
  RefreshLeft,
  Share,
  Delete,
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
  const d = new Date(ms)
  const date = d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
  const time = String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0')
  return `${date} ${time}`
}

function formatDateOnly(ms: number) {
  const d = new Date(ms)
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

const backupDialog = ref(false)
const backupName = ref('')

function openBackupDialog() {
  backupName.value = profileStore.activeProfile?.name ?? 'backup'
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

async function createFileBackupDirect(file: SettingsFile) {
  const name = file.path.split('/').pop()?.replace(/\.dat$/, '') ?? file.id
  await backupStore.createFileBackup(file.path, name)
}

// ── Sync ──────────────────────────────────────────────────────────────────────
const syncDialog = ref(false)
const syncSource = ref<SettingsFile | null>(null)
const syncSelected = ref<string[]>([])

const syncTargets = computed(() => {
  if (!syncSource.value) return []
  const src = syncSource.value
  const pool = src.type === 'char' ? settingsStore.charFiles : settingsStore.userFiles
  return pool.filter(f => f.path !== src.path)
})

function syncTargetLabel(file: SettingsFile): string {
  return file.type === 'char'
    ? ((file as CharFile).charName ?? file.id)
    : `Account ${file.id}`
}

const syncAllChecked = computed(() =>
  syncTargets.value.length > 0 && syncSelected.value.length === syncTargets.value.length
)

function openSyncDialog(file: SettingsFile) {
  syncSource.value = file
  syncSelected.value = syncTargets.value.map(f => f.path)
  syncDialog.value = true
}

function setSyncAll(val: boolean) {
  syncSelected.value = val ? syncTargets.value.map(f => f.path) : []
}

async function confirmSync() {
  if (!syncSource.value || !syncSelected.value.length) return
  syncDialog.value = false
  const src = syncSource.value
  const targets = [...syncSelected.value]
  syncSource.value = null
  syncSelected.value = []
  openWarnDialog(
    t('warn.syncDetail', { n: targets.length }),
    () => settingsStore.syncSettings(src.path, targets)
  )
}

// ── Warning dialog ─────────────────────────────────────────────────────────────
const warnDialog = ref(false)
const warnTitle = ref('')
const warnDetail = ref('')
const warnAction = ref<(() => Promise<void>) | null>(null)

function openWarnDialog(detail: string, action: () => Promise<void>, title?: string) {
  warnTitle.value = title ?? ''
  warnDetail.value = detail
  warnAction.value = action
  warnDialog.value = true
}

async function proceedWarn() {
  warnDialog.value = false
  if (warnAction.value) await warnAction.value()
  warnAction.value = null
}

// ── Backup put back ────────────────────────────────────────────────────────────
function backupDisplayName(backup: Backup): string {
  if (backup.type === 'folder') return backup.name
  const charMatch = backup.name.match(/^core_char_(.+)$/)
  if (charMatch) {
    const charFile = settingsStore.charFiles.find(f => f.id === charMatch[1])
    return charFile?.charName ?? charMatch[1]
  }
  const userMatch = backup.name.match(/^core_user_(.+)$/)
  if (userMatch) return `Account ${userMatch[1]}`
  return backup.name
}

function putBackFile(backup: Backup) {
  openWarnDialog(
    t('warn.putBackFileDetail', { name: backupDisplayName(backup) }),
    () => backupStore.restoreFileBackup(backup.name)
  )
}

function putBackFolder(backup: Backup) {
  openWarnDialog(
    t('warn.backupFolderDetail', { name: backup.name }),
    () => backupStore.restoreBackup(backup.name)
  )
}

function deleteBackupItem(backup: Backup) {
  openWarnDialog(
    t('warn.deleteBackupDetail', { name: backupDisplayName(backup) }),
    () => backup.type === 'file'
      ? backupStore.deleteFileBackup(backup.name)
      : backupStore.deleteBackup(backup.name),
    t('warn.deleteBackupTitle')
  )
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
              <Document v-if="backup.type === 'file'" />
              <Files v-else />
            </el-icon>
            <div class="backup-item-text">
              <span class="backup-name">{{ backupDisplayName(backup) }}</span>
              <span class="backup-meta">{{ formatDateOnly(backup.createdAt) }}</span>
              <span class="backup-meta">{{ backup.type === 'file' ? t('sidebar.singleFile') : t('sidebar.files', { n: backup.fileCount }) }}</span>
            </div>
            <el-tooltip :content="t('sidebar.showInFolder')" placement="top">
              <el-icon class="backup-action-btn backup-reveal-btn" @click.stop="revealBackup(backup.path)">
                <FolderOpened />
              </el-icon>
            </el-tooltip>
            <el-tooltip :content="t('sidebar.restoreBackup')" placement="top">
              <el-icon
                class="backup-action-btn backup-restore-btn"
                @click.stop="backup.type === 'file' ? putBackFile(backup) : putBackFolder(backup)"
              ><RefreshLeft /></el-icon>
            </el-tooltip>
            <el-tooltip :content="t('sidebar.deleteBackup')" placement="top">
              <el-icon
                class="backup-action-btn backup-delete-btn"
                @click.stop="deleteBackupItem(backup)"
              ><Delete /></el-icon>
            </el-tooltip>
          </div>
          <div v-if="!backupStore.backups.length && profileStore.activeProfile" class="sidebar-item sidebar-empty">
            {{ t('sidebar.noBackups') }}
          </div>
        </div>

        <!-- Language selector -->
        <div class="sidebar-lang">
          <svg class="lang-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
          <el-select
            :model-value="language"
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
          <div class="table-col table-col-char">
            <div class="table-label">{{ t('table.characters') }}</div>
            <el-table
              :data="settingsStore.charFiles"
              size="small"
              :empty-text="profileStore.activeProfile ? t('table.noCharFiles') : t('table.selectProfile')"
              class="settings-table"
            >
              <el-table-column prop="charName" :label="t('table.colCharacter')" sortable min-width="45">
                <template #default="{ row }">{{ row.charName ?? row.id }}</template>
              </el-table-column>
              <el-table-column prop="id" :label="t('table.colId')" width="110" />
              <el-table-column prop="modifiedAt" :label="t('table.colModified')" sortable width="150">
                <template #default="{ row }">{{ formatDate(row.modifiedAt) }}</template>
              </el-table-column>
              <el-table-column width="64" class-name="row-actions">
                <template #default="{ row }">
                  <div class="row-actions-cell">
                    <el-tooltip :content="t('table.backupFile')" placement="top">
                      <el-icon class="row-icon backup-icon" @click.stop="createFileBackupDirect(row)"><DocumentCopy /></el-icon>
                    </el-tooltip>
                    <el-tooltip :content="t('table.syncTip')" placement="top">
                      <el-icon class="row-icon sync-icon" @click.stop="openSyncDialog(row)"><Share /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="table-divider" />

          <!-- Accounts -->
          <div class="table-col table-col-account">
            <div class="table-label">{{ t('table.accounts') }}</div>
            <el-table
              :data="settingsStore.userFiles"
              size="small"
              :empty-text="profileStore.activeProfile ? t('table.noAccountFiles') : t('table.selectProfile')"
              class="settings-table"
            >
              <el-table-column prop="id" :label="t('table.colAccountId')" sortable min-width="110" />
              <el-table-column prop="modifiedAt" :label="t('table.colModified')" sortable width="150">
                <template #default="{ row }">{{ formatDate(row.modifiedAt) }}</template>
              </el-table-column>
              <el-table-column width="64" class-name="row-actions">
                <template #default="{ row }">
                  <div class="row-actions-cell">
                    <el-tooltip :content="t('table.backupFile')" placement="top">
                      <el-icon class="row-icon backup-icon" @click.stop="createFileBackupDirect(row)"><DocumentCopy /></el-icon>
                    </el-tooltip>
                    <el-tooltip :content="t('table.syncTipAccount')" placement="top">
                      <el-icon class="row-icon sync-icon" @click.stop="openSyncDialog(row)"><Share /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- Action bar -->
        <div class="action-bar">
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

    <!-- Sync picker dialog -->
    <el-dialog v-model="syncDialog" :title="t('dialog.syncTitle')" width="360px">
      <div v-if="syncTargets.length" class="sync-dialog-body">
        <div class="sync-select-all">
          <el-checkbox :model-value="syncAllChecked" @change="setSyncAll">{{ t('dialog.selectAll') }}</el-checkbox>
        </div>
        <div class="sync-target-list">
          <el-checkbox
            v-for="file in syncTargets"
            :key="file.path"
            :label="file.path"
            v-model="syncSelected"
          >{{ syncTargetLabel(file) }}</el-checkbox>
        </div>
      </div>
      <p v-else class="sync-no-targets">{{ t('dialog.syncNoTargets') }}</p>
      <template #footer>
        <el-button @click="syncDialog = false">{{ t('dialog.cancel') }}</el-button>
        <el-button type="primary" :disabled="!syncSelected.length" @click="confirmSync">{{ t('dialog.sync') }}</el-button>
      </template>
    </el-dialog>

    <!-- Overwrite warning dialog -->
    <el-dialog v-model="warnDialog" :title="warnTitle || t('warn.title')" width="400px">
      <div class="warn-body">
        <p class="warn-detail">{{ warnDetail }}</p>
        <p class="warn-suggest">
          <el-icon class="warn-icon"><Warning /></el-icon>
          {{ t('warn.suggest') }}
        </p>
      </div>
      <template #footer>
        <el-button @click="warnDialog = false">{{ t('dialog.cancel') }}</el-button>
        <el-button type="danger" @click="proceedWarn">{{ t('warn.proceed') }}</el-button>
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
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0 0;
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}
.sidebar-lang {
  margin-top: auto;
  padding: 6px 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  gap: 7px;
}
.sidebar-lang .el-select { flex: 1; }
.lang-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}
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
.sidebar-item-icon { font-size: 18px; }
.sidebar-empty { color: var(--el-text-color-placeholder); font-size: 14px; cursor: default; }
.sidebar-empty:hover { background: none; }
.sidebar-divider { margin: 8px 0; border-top: 1px solid var(--el-border-color-lighter); }
.backup-item { align-items: flex-start; }
.backup-action-btn {
  align-self: flex-end;
  flex-shrink: 0;
  cursor: pointer;
  font-size: 18px !important;
}
.backup-reveal-btn { color: var(--el-color-primary) !important; }
.backup-restore-btn { color: #4caf6e !important; }
.backup-delete-btn { color: var(--el-color-danger) !important; }
.backup-item-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
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
.table-col-char { flex: 3; }
.table-col-account { flex: 2; }
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
.settings-table .el-table__inner-wrapper::before { display: none !important; }
.settings-table .el-table__border-bottom-patch { display: none !important; }
.settings-table .el-table__cell { font-size: 15px !important; padding: 10px 0 !important; }
.settings-table .el-table__row:hover td.el-table__cell { background: var(--el-color-primary-light-8) !important; }

/* Action bar */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Row actions */
.row-actions-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.row-icon {
  cursor: pointer;
  font-size: 18px !important;
}
.backup-icon { color: var(--el-color-primary) !important; }
.sync-icon { color: #4caf6e !important; }

/* Warning dialog */
.warn-body { display: flex; flex-direction: column; gap: 10px; }
.warn-detail { margin: 0; font-size: 13px; }
.warn-suggest { margin: 0; font-size: 12px; color: var(--el-color-warning); display: flex; align-items: center; gap: 5px; }
.warn-icon { font-size: 14px !important; flex-shrink: 0; }

/* Sync dialog */
.sync-dialog-body { display: flex; flex-direction: column; gap: 6px; }
.sync-select-all { padding-bottom: 4px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sync-target-list { display: flex; flex-direction: column; gap: 2px; max-height: 240px; overflow-y: auto; padding: 2px 0; }
.sync-target-list .el-checkbox { margin: 0 !important; height: 26px; font-size: 12px; }
.sync-no-targets { margin: 0; font-size: 13px; color: var(--el-text-color-placeholder); }

/* Misc */
.loading-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.mr-1 { margin-right: 4px; }
.flex-1 { flex: 1; }

/* Tooltip fade-out (EP only ships the enter half by default) */
.el-fade-in-linear-leave-active { transition: opacity 0.15s linear !important; }
.el-fade-in-linear-leave-to { opacity: 0 !important; }
</style>
