<script setup lang="ts">
import { onMounted, watch, ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from './stores/useServerStore'
import { useProfileStore } from './stores/useProfileStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useBackupStore } from './stores/useBackupStore'
import type { CharFile, SettingsFile, Backup } from './types'
import {
  FolderOpened,
  Files,
  Document,
  CopyDocument,
  Warning,
  DocumentCopy,
  RefreshLeft,
  Share,
  Delete,
  Sunny,
  Moon,
  Plus,
  MoreFilled,
  Remove,
  Monitor,
  QuestionFilled,
} from '@element-plus/icons-vue'

const { t, locale } = useI18n()

const serverStore = useServerStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()
const backupStore = useBackupStore()

const fixturePath = import.meta.env.VITE_FIXTURE_PATH as string | undefined

onMounted(() => {
  serverStore.detectFolder(fixturePath)
  backupStore.loadBackups()
})

watch(() => serverStore.activeServer, async (server) => {
  if (!server) return
  await profileStore.loadProfiles()
  await serverStore.refreshStatus()
})

watch(() => profileStore.activeProfile, async (profile) => {
  if (!profile) return
  await settingsStore.loadSettings()
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
  ;(document.activeElement as HTMLElement)?.blur()
  backupDialog.value = false
  await backupStore.createBackup(name)
}

async function createFileBackupDirect(file: SettingsFile) {
  const name = file.path.split('/').pop()?.replace(/\.dat$/, '') ?? file.id
  const displayName = file.type === 'char'
    ? (file.charName ?? settingsStore.charNames[file.id])
    : `Account ${file.id}`
  await backupStore.createFileBackup(file.path, name, displayName)
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
  await nextTick()
  await settingsStore.syncSettings(src.path, targets)
}

// ── Warning dialog ─────────────────────────────────────────────────────────────
const warnDialog = ref(false)
const warnTitle = ref('')
const warnDetail = ref('')
const warnShowSuggest = ref(true)
const warnAction = ref<(() => Promise<void>) | null>(null)
const warnType = ref<'confirm' | 'danger'>('danger')

function openWarnDialog(detail: string, action: () => Promise<void>, title?: string, showSuggest = true, type: 'confirm' | 'danger' = 'danger') {
  warnTitle.value = title ?? ''
  warnDetail.value = detail
  warnShowSuggest.value = showSuggest
  warnAction.value = action
  warnType.value = type
  warnDialog.value = true
}

async function proceedWarn() {
  warnDialog.value = false
  const action = warnAction.value
  warnAction.value = null
  await nextTick()
  if (action) await action()
}

// ── Backup put back ────────────────────────────────────────────────────────────
function backupDisplayName(backup: Backup): string {
  if (backup.type === 'folder') return backup.name
  if (backup.displayName) return backup.displayName
  const charMatch = backup.name.match(/^core_char_(.+)$/)
  if (charMatch) {
    return settingsStore.charNames[charMatch[1]]
      ?? settingsStore.charFiles.find(f => f.id === charMatch[1])?.charName
      ?? charMatch[1]
  }
  const userMatch = backup.name.match(/^core_user_(.+)$/)
  if (userMatch) return `Account ${userMatch[1]}`
  return backup.name
}

function putBackFile(backup: Backup) {
  openWarnDialog(
    t('warn.putBackFileDetail', { name: backupDisplayName(backup) }),
    () => backupStore.restoreFileBackup(backup),
    undefined,
    false,
    'confirm'
  )
}

function putBackFolder(backup: Backup) {
  openWarnDialog(
    t('warn.backupFolderDetail', { name: backup.name }),
    () => backupStore.restoreBackup(backup),
    undefined,
    false,
    'confirm'
  )
}

function deleteBackupItem(backup: Backup) {
  openWarnDialog(
    t('warn.deleteBackupDetail', { name: backupDisplayName(backup) }),
    () => backup.type === 'file'
      ? backupStore.deleteFileBackup(backup)
      : backupStore.deleteBackup(backup),
    t('warn.deleteBackupTitle'),
    false
  )
}

const LANGUAGES = [
  { value: 'en',     label: 'English' },
  { value: 'zh-CN',  label: '简体中文' },
  { value: 'zh-CHT', label: '繁體中文' },
  { value: 'ru',     label: 'Русский' },
  { value: 'de',     label: 'Deutsch' },
  { value: 'fr',     label: 'Français' },
  { value: 'es',     label: 'Español' },
  { value: 'pt-BR',  label: 'Português (BR)' },
  { value: 'ko',     label: '한국어' },
  { value: 'ja',     label: '日本語' },
  { value: 'pl',     label: 'Polski' },
]

const language = ref('en')

// ── Profile dialog ─────────────────────────────────────────────────────────────
const profileDialog = ref(false)
const profileDialogMode = ref<'create' | 'rename' | 'duplicate'>('create')
const profileName = ref('')
const profileNameError = ref('')

const profileDialogTitle = computed(() => {
  if (profileDialogMode.value === 'rename') return t('profile.rename')
  if (profileDialogMode.value === 'duplicate') return t('profile.duplicate')
  return t('profile.create')
})

function openProfileDialog(mode: 'create' | 'rename' | 'duplicate') {
  profileDialogMode.value = mode
  profileNameError.value = ''
  if (mode === 'rename') {
    profileName.value = profileStore.activeProfile?.name ?? ''
  } else if (mode === 'duplicate') {
    profileName.value = t('profile.duplicateOf', { name: profileStore.activeProfile?.name ?? '' })
  } else {
    profileName.value = ''
  }
  profileDialog.value = true
}

function onProfileMenuCommand(cmd: string) {
  if (cmd === 'rename') openProfileDialog('rename')
  else if (cmd === 'duplicate') openProfileDialog('duplicate')
  else if (cmd === 'delete') confirmDeleteProfile()
}

function validateProfileName(name: string): boolean {
  if (!name.trim()) {
    profileNameError.value = t('profile.nameEmpty')
    return false
  }
  const currentLower = profileDialogMode.value === 'rename' ? profileStore.activeProfile?.name?.toLowerCase() : null
  const duplicate = profileStore.profiles.some(p =>
    p.name.toLowerCase() === name.trim().toLowerCase() && p.name.toLowerCase() !== currentLower
  )
  if (duplicate) {
    profileNameError.value = t('profile.nameDuplicate')
    return false
  }
  return true
}

async function confirmProfileDialog() {
  const name = profileName.value.trim()
  if (!validateProfileName(name)) return
  profileDialog.value = false
  profileNameError.value = ''
  if (profileDialogMode.value === 'create') {
    await profileStore.createProfile(name)
    const created = profileStore.profiles.find(p => p.name === name)
    if (created) await profileStore.selectProfile(created)
  } else if (profileDialogMode.value === 'rename') {
    const oldName = profileStore.activeProfile!.name
    await profileStore.renameProfile(oldName, name)
    const renamed = profileStore.profiles.find(p => p.name === name)
    if (renamed) await profileStore.selectProfile(renamed)
  } else if (profileDialogMode.value === 'duplicate') {
    const sourceName = profileStore.activeProfile!.name
    await profileStore.duplicateProfile(sourceName, name)
    const duped = profileStore.profiles.find(p => p.name === name)
    if (duped) await profileStore.selectProfile(duped)
  }
}

function confirmDeleteProfile() {
  const name = profileStore.activeProfile?.name
  if (!name) return
  openWarnDialog(
    t('profile.deleteDetail', { name }),
    () => profileStore.deleteProfile(name),
    t('profile.deleteTitle'),
    false
  )
}

// ── Server name localization ───────────────────────────────────────────────────
const SERVER_KEY_MAP: Record<string, string> = {
  'Tranquility': 'tranquility',
  'Serenity': 'serenity',
  'Infinity': 'infinity',
  'Singularity': 'singularity',
  'Duality': 'duality',
  'Thunderdome': 'thunderdome',
}

function localizeServerName(displayName: string): string {
  const base = displayName.replace(/\s*\(.*\)$/, '').trim()
  const suffix = displayName.match(/\s*\(.*\)$/)?.[0] ?? ''
  const key = SERVER_KEY_MAP[base]
  if (!key) return displayName
  return t(`serverNames.${key}`) + suffix
}

// ── Notes inline ───────────────────────────────────────────────────────────────
async function saveNote(filename: string, val: string) {
  const trimmed = val.trim()
  if (trimmed) {
    await settingsStore.setDescription(filename, trimmed)
  } else {
    await settingsStore.deleteDescription(filename)
  }
}

// ── GitHub ─────────────────────────────────────────────────────────────────────
function openGitHub() {
  window.ipcRenderer.invoke('shell:open-external', 'https://github.com/mintnick/eve-settings-manager')
}

// ── Help ───────────────────────────────────────────────────────────────────────
const README_URLS: Record<string, string> = {
  'zh-CN':  'https://github.com/mintnick/eve-settings-manager/blob/main/docs/README.zh-CN.md',
  'zh-CHT': 'https://github.com/mintnick/eve-settings-manager/blob/main/docs/README.zh-CHT.md',
  'ja':     'https://github.com/mintnick/eve-settings-manager/blob/main/docs/README.ja.md',
  'ko':     'https://github.com/mintnick/eve-settings-manager/blob/main/docs/README.ko.md',
  'fr':     'https://github.com/mintnick/eve-settings-manager/blob/main/docs/README.fr.md',
  'de':     'https://github.com/mintnick/eve-settings-manager/blob/main/docs/README.de.md',
  'es':     'https://github.com/mintnick/eve-settings-manager/blob/main/docs/README.es.md',
}
const FALLBACK_README = 'https://github.com/mintnick/eve-settings-manager/blob/main/README.md'

function openHelp() {
  const url = README_URLS[language.value] ?? FALLBACK_README
  window.ipcRenderer.invoke('shell:open-external', url)
}

// ── Theme ──────────────────────────────────────────────────────────────────────
const isDark = ref(false)

function applyTheme(dark: boolean) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
}

async function toggleTheme() {
  applyTheme(!isDark.value)
  await window.ipcRenderer.invoke('store:set-theme', isDark.value ? 'dark' : 'light')
}

// ── Language ───────────────────────────────────────────────────────────────────
function detectSystemLanguage(): string {
  const sys = navigator.language.toLowerCase()
  if (sys.startsWith('zh'))
    return (sys.includes('tw') || sys.includes('hk') || sys.includes('hant')) ? 'zh-CHT' : 'zh-CN'
  if (sys.startsWith('ja')) return 'ja'
  if (sys.startsWith('ko')) return 'ko'
  if (sys.startsWith('fr')) return 'fr'
  if (sys.startsWith('de')) return 'de'
  if (sys.startsWith('es')) return 'es'
  if (sys.startsWith('ru')) return 'ru'
  if (sys.startsWith('pt')) return 'pt-BR'
  if (sys.startsWith('pl')) return 'pl'
  return 'en'
}

onMounted(async () => {
  const [savedTheme, savedLang] = await Promise.all([
    window.ipcRenderer.invoke('store:get-theme'),
    window.ipcRenderer.invoke('store:get-language'),
  ])

  const dark = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  if (!savedTheme) await window.ipcRenderer.invoke('store:set-theme', dark ? 'dark' : 'light')
  applyTheme(dark)

  const lang = savedLang ?? detectSystemLanguage()
  if (!savedLang) await window.ipcRenderer.invoke('store:set-language', lang)
  language.value = lang
  locale.value = lang
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
          <div class="sidebar-label"><el-icon class="sidebar-label-icon"><Monitor /></el-icon>{{ t('sidebar.servers') }}</div>
          <div
            v-for="server in serverStore.servers"
            :key="server.path"
            class="sidebar-item sidebar-server-item"
            :class="{ active: serverStore.activeServer?.path === server.path }"
            @click="serverStore.selectServer(server)"
          >
            {{ localizeServerName(server.displayName) }}
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
              <span class="backup-meta">{{ backup.profileName }}</span>
              <span class="backup-meta">{{ formatDateOnly(backup.createdAt) }} · {{ backup.type === 'file' ? t('sidebar.singleFile') : t('sidebar.files', { n: backup.fileCount }) }}</span>
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
          <div v-if="!backupStore.backups.length" class="sidebar-item sidebar-empty">
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
            popper-class="lang-dropdown"
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
          <div class="profile-tab-actions">
            <el-tooltip :content="t('profile.create')" placement="top">
              <el-icon class="profile-tab-btn" @click="openProfileDialog('create')"><Plus /></el-icon>
            </el-tooltip>
            <el-dropdown trigger="click" @command="onProfileMenuCommand">
              <el-icon class="profile-tab-btn"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">{{ t('profile.rename') }}</el-dropdown-item>
                  <el-dropdown-item command="duplicate">{{ t('profile.duplicate') }}</el-dropdown-item>
                  <el-dropdown-item
                    command="delete"
                    :disabled="profileStore.profiles.length <= 1"
                  >{{ t('profile.delete') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
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
              <el-table-column prop="id" :label="t('table.colAccountId')" sortable width="110" />
              <el-table-column :label="t('table.colNotes')" min-width="45">
                <template #default="{ row }">
                  <div class="notes-cell">
                    <el-input
                      :model-value="settingsStore.descriptions[row.filename] ?? ''"
                      class="notes-inline-input"
                      @input="(val: string) => { settingsStore.descriptions[row.filename] = val }"
                      @change="(val: string) => saveNote(row.filename, val)"
                      @keydown.enter="($event.target as HTMLElement).blur()"
                    />
                    <el-tooltip v-if="settingsStore.descriptions[row.filename]" :content="t('table.clearNote')" placement="top">
                      <el-icon class="notes-cell-clear" @click.stop="settingsStore.deleteDescription(row.filename)"><Remove /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
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
            <el-icon class="mr-1"><CopyDocument /></el-icon>
            {{ t('actions.backup') }}
          </el-button>
          <el-button :disabled="!serverStore.activeServer" @click="openServerFolder()">
            <el-icon class="mr-1"><FolderOpened /></el-icon>
            {{ t('actions.openFolder') }}
          </el-button>
          <div class="action-bar-right">
            <el-tooltip :content="isDark ? t('actions.lightMode') : t('actions.darkMode')" placement="top">
              <el-icon class="theme-toggle-btn" @click="toggleTheme()">
                <Sunny v-if="isDark" />
                <Moon v-else />
              </el-icon>
            </el-tooltip>
            <el-tooltip content="GitHub" placement="top">
              <el-icon class="theme-toggle-btn" @click="openGitHub()">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              </el-icon>
            </el-tooltip>
            <el-tooltip :content="t('actions.help')" placement="top">
              <el-icon class="theme-toggle-btn" @click="openHelp()"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </div>

      </div>
    </div>

    <!-- Profile name dialog -->
    <el-dialog v-model="profileDialog" :title="profileDialogTitle" width="360px" @keydown.enter="confirmProfileDialog" @open="profileNameError = ''">
      <el-input v-model="profileName" :placeholder="t('profile.namePlaceholder')" autofocus @input="profileNameError = ''" />
      <div v-if="profileNameError" class="profile-name-error">{{ profileNameError }}</div>
      <template #footer>
        <el-button @click="profileDialog = false">{{ t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirmProfileDialog">{{ t('dialog.save') }}</el-button>
      </template>
    </el-dialog>


<!-- Backup name dialog -->
    <el-dialog v-model="backupDialog" :title="t('dialog.saveBackup')" width="400px">
      <el-input v-model="backupName" :placeholder="t('dialog.backupName')" autofocus @keydown.enter.prevent="confirmBackup" />
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
        <el-checkbox-group v-model="syncSelected" class="sync-target-list">
          <el-checkbox
            v-for="file in syncTargets"
            :key="file.path"
            :value="file.path"
          >{{ syncTargetLabel(file) }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <p v-else class="sync-no-targets">{{ t('dialog.syncNoTargets') }}</p>
      <p v-if="syncTargets.length" class="warn-suggest sync-warn">
        <el-icon class="warn-icon"><Warning /></el-icon>
        {{ t('warn.suggest') }}
      </p>
      <template #footer>
        <el-button @click="syncDialog = false">{{ t('dialog.cancel') }}</el-button>
        <el-button class="btn-confirm" :disabled="!syncSelected.length" @click="confirmSync">{{ t('dialog.sync') }}</el-button>
      </template>
    </el-dialog>

    <!-- Overwrite warning dialog -->
    <el-dialog v-model="warnDialog" :title="warnTitle || t('warn.title')" width="400px">
      <div class="warn-body">
        <p class="warn-detail">{{ warnDetail }}</p>
        <p v-if="warnShowSuggest" class="warn-suggest">
          <el-icon class="warn-icon"><Warning /></el-icon>
          {{ t('warn.suggest') }}
        </p>
      </div>
      <template #footer>
        <el-button @click="warnDialog = false">{{ t('dialog.cancel') }}</el-button>
        <el-button :class="warnType === 'danger' ? 'btn-danger' : 'btn-confirm'" @click="proceedWarn">{{ t('warn.proceed') }}</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<style>
/* Dialog action button colors */
.btn-confirm.el-button {
  --el-button-bg-color: #10b981;
  --el-button-border-color: #10b981;
  --el-button-hover-bg-color: #059669;
  --el-button-hover-border-color: #059669;
  --el-button-active-bg-color: #047857;
  --el-button-active-border-color: #047857;
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
}
.btn-danger.el-button {
  --el-button-bg-color: #f43f5e;
  --el-button-border-color: #f43f5e;
  --el-button-hover-bg-color: #e11d48;
  --el-button-hover-border-color: #e11d48;
  --el-button-active-bg-color: #be123c;
  --el-button-active-border-color: #be123c;
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
}

/* Softer light theme — less blinding for EVE players */
html:not(.dark) {
  --el-bg-color: #e8eaef;
  --el-bg-color-page: #cdd2dc;
  --el-bg-color-overlay: #eceef2;
  --el-fill-color-blank: #e8eaef;
  --el-fill-color-light: #c0c6d2;
  --el-fill-color: #b6bcc9;
  --el-table-bg-color: #e8eaef;
  --el-table-tr-bg-color: #e8eaef;
  --el-table-header-bg-color: #cdd2dc;
  --el-table-row-hover-bg-color: #c0c6d2;
}

/* Light mode table row hover — use neutral instead of primary tint */
html:not(.dark) .settings-table .el-table__row:hover td.el-table__cell {
  background: var(--el-fill-color-light) !important;
}

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
.lang-dropdown .el-select-dropdown__wrap { max-height: none; }
.lang-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}
.sidebar-section { padding: 0 4px; }
.sidebar-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-success);
  letter-spacing: 0.02em;
  padding: 10px 10px 4px;
  text-align: center;
}
.sidebar-label-icon { font-size: 14px !important; margin-right: 5px; vertical-align: middle; }
.sidebar-server-item { font-size: 16px; justify-content: center; font-weight: 500; }
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
  min-width: 0;
}
.profile-tabs .el-tabs__header { margin: 0; }
.profile-tabs .el-tabs__nav-wrap::after { display: none; }
.profile-tab-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding-left: 6px;
  margin-right: 10px;
}
.profile-tab-btn {
  cursor: pointer;
  font-size: 16px !important;
  color: var(--el-text-color-secondary);
  padding: 4px;
  border-radius: 4px;
}
.profile-tab-btn:hover { color: var(--el-text-color-primary); background: var(--el-fill-color-light); }
.profile-name-error { font-size: 12px; color: var(--el-color-danger); margin-top: 6px; }

/* Tables */
.tables-row {
  flex: 1;
  display: flex;
  overflow: auto;
  min-height: 0;
}
.table-col { flex: 1; padding: 12px; min-width: 0; display: flex; flex-direction: column; }
.table-col-char { flex: 3; }
.table-col-account { flex: 3; }
.table-label {
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
  text-align: center;
}
.table-divider { width: 1px; background: var(--el-border-color); flex-shrink: 0; }
.settings-table { flex: 1; }
.settings-table .el-table__inner-wrapper::before { display: none !important; }
.settings-table .el-table__border-bottom-patch { display: none !important; }
.settings-table .el-table__row { height: 46px; }
.settings-table .el-table__cell { font-size: 15px !important; padding: 0 !important; }
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
  position: relative;
}
.action-bar .el-button {
  width: 150px;
  white-space: nowrap;
}
.action-bar-right {
  position: absolute;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.theme-toggle-btn {
  cursor: pointer;
  font-size: 18px !important;
  color: var(--el-text-color-secondary);
}
.theme-toggle-btn:hover { color: var(--el-text-color-primary); }

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
.notes-icon { color: var(--el-text-color-secondary) !important; }
.notes-icon:hover { color: var(--el-text-color-primary) !important; }
.backup-icon { color: var(--el-color-primary) !important; }
.sync-icon { color: #4caf6e !important; }
.notes-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.notes-inline-input { flex: 1; min-width: 0; height: 100%; }
.notes-inline-input .el-input__wrapper {
  height: 100% !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 4px;
}
.notes-inline-input .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
}
.notes-inline-input .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
  background: var(--el-fill-color-blank) !important;
}
.notes-inline-input .el-input__inner {
  font-size: 15px !important;
  color: var(--el-text-color-secondary) !important;
}
.notes-cell-clear {
  flex-shrink: 0;
  font-size: 20px !important;
  color: var(--el-color-danger) !important;
  cursor: pointer;
  opacity: 0.7;
}
.notes-cell-clear:hover { opacity: 1; }

/* Warning dialog */
.warn-body { display: flex; flex-direction: column; gap: 10px; }
.warn-detail { margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-line; }
.warn-suggest { margin: 0; font-size: 12px; color: var(--el-color-warning); display: flex; align-items: center; gap: 5px; }
.warn-icon { font-size: 14px !important; flex-shrink: 0; }

/* Sync dialog */
.sync-dialog-body { display: flex; flex-direction: column; gap: 6px; }
.sync-select-all { padding-bottom: 4px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sync-target-list { display: flex; flex-direction: column; gap: 2px; max-height: 240px; overflow-y: auto; padding: 2px 0; }
.sync-target-list .el-checkbox { margin: 0 !important; height: 26px; font-size: 12px; }
.sync-no-targets { margin: 0; font-size: 13px; color: var(--el-text-color-placeholder); }
.sync-warn { margin-top: 10px; }

/* Misc */
.loading-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.mr-1 { margin-right: 4px; }
.flex-1 { flex: 1; }

/* Tooltips — no animation */
.el-fade-in-linear-enter-active,
.el-fade-in-linear-leave-active { transition: none !important; }
.el-fade-in-linear-enter-from,
.el-fade-in-linear-leave-to { opacity: 0 !important; }
</style>
