<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useServerStore } from './stores/useServerStore'
import { useProfileStore } from './stores/useProfileStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useBackupStore } from './stores/useBackupStore'
import type { ServerDir, Profile, CharFile, UserFile } from './types'

const serverStore = useServerStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()
const backupStore = useBackupStore()

onMounted(() => {
  const fixturePath = import.meta.env.VITE_FIXTURE_PATH as string | undefined
  serverStore.detectFolder(fixturePath)
})

// When active server changes, load profiles + status
watch(() => serverStore.activeServer, async (server) => {
  if (!server) return
  await profileStore.loadProfiles()
  await serverStore.refreshStatus()
})

// When active profile changes, load settings + backups
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
  backupName.value = `backup_${new Date().toISOString().slice(0, 10)}`
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
</script>

<template>
  <v-app>
    <!-- ── Top bar ───────────────────────────────────────────────── -->
    <v-app-bar elevation="1" density="compact">
      <v-app-bar-title>
        <span class="text-body-1 font-weight-bold">EVE Settings Manager</span>
      </v-app-bar-title>

      <!-- Server selector -->
      <template v-if="serverStore.servers.length">
        <v-select
          :model-value="serverStore.activeServer"
          :items="serverStore.servers"
          item-title="name"
          item-value="path"
          return-object
          density="compact"
          hide-details
          variant="outlined"
          style="max-width: 220px"
          class="mr-3"
          @update:model-value="(s: ServerDir) => serverStore.selectServer(s)"
        />
      </template>

      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-folder-open"
        @click="serverStore.openFolderDialog()"
      >
        {{ serverStore.eveFolder ? 'Change folder' : 'Set EVE folder' }}
      </v-btn>
    </v-app-bar>

    <!-- ── Body ─────────────────────────────────────────────────── -->
    <v-main>

      <!-- No folder found yet -->
      <div v-if="!serverStore.hasFolder && !serverStore.loadingFolder" class="d-flex flex-column align-center justify-center fill-height">
        <v-icon size="64" color="grey-darken-1" class="mb-4">mdi-folder-alert</v-icon>
        <p class="text-h6 mb-2">EVE settings folder not found</p>
        <p class="text-body-2 text-grey mb-6">Make sure EVE Online is installed, or set the folder manually.</p>
        <v-btn color="primary" @click="serverStore.openFolderDialog()">Select folder</v-btn>
      </div>

      <!-- Loading -->
      <div v-else-if="serverStore.loadingFolder" class="d-flex align-center justify-center fill-height">
        <v-progress-circular indeterminate />
      </div>

      <!-- Main layout -->
      <div v-else class="d-flex fill-height" style="overflow: hidden">

        <!-- ── Sidebar ─────────────────────────────────────────── -->
        <v-navigation-drawer permanent width="200">
          <v-list nav density="compact" class="mt-1">
            <v-list-subheader>Servers</v-list-subheader>
            <v-list-item
              v-for="server in serverStore.servers"
              :key="server.path"
              :value="server"
              :active="serverStore.activeServer?.path === server.path"
              active-color="primary"
              rounded="lg"
              @click="serverStore.selectServer(server)"
            >
              <v-list-item-title class="text-body-2">{{ server.name }}</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-subheader>Backups</v-list-subheader>
            <v-list-item
              v-for="backup in backupStore.backups"
              :key="backup.name"
              rounded="lg"
            >
              <v-list-item-title class="text-body-2">{{ backup.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ backup.fileCount }} files</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="!backupStore.backups.length && profileStore.activeProfile" rounded="lg" disabled>
              <v-list-item-title class="text-caption text-grey">No backups yet</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>

        <!-- ── Right panel ─────────────────────────────────────── -->
        <div class="flex-1-1 d-flex flex-column" style="overflow: hidden; min-width: 0">

          <!-- Profile tabs -->
          <v-tabs
            v-if="profileStore.profiles.length"
            :model-value="profileStore.activeProfile?.name"
            density="compact"
            color="primary"
            bg-color="surface-variant"
            @update:model-value="(name: string) => {
              const p = profileStore.profiles.find(x => x.name === name)
              if (p) profileStore.selectProfile(p)
            }"
          >
            <v-tab v-for="p in profileStore.profiles" :key="p.name" :value="p.name">
              {{ p.name }}
            </v-tab>
          </v-tabs>

          <!-- Settings tables -->
          <div v-if="settingsStore.loading" class="d-flex align-center justify-center flex-1-1">
            <v-progress-circular indeterminate />
          </div>

          <div v-else class="d-flex flex-1-1" style="overflow: auto; min-height: 0; gap: 0">

            <!-- Characters -->
            <div class="flex-1-1 pa-3" style="min-width: 0">
              <p class="text-overline text-grey mb-2">Characters</p>
              <v-data-table
                :headers="[
                  { title: 'Character', key: 'charName', sortable: true },
                  { title: 'ID', key: 'id' },
                  { title: 'Modified', key: 'modifiedAt', sortable: true },
                ]"
                :items="settingsStore.charFiles"
                density="compact"
                hover
                :no-data-text="profileStore.activeProfile ? 'No character files found' : 'Select a profile'"
              >
                <template #item.charName="{ item }: { item: CharFile }">
                  {{ item.charName ?? item.id }}
                </template>
                <template #item.modifiedAt="{ item }: { item: CharFile }">
                  {{ formatDate(item.modifiedAt) }}
                </template>
              </v-data-table>
            </div>

            <v-divider vertical />

            <!-- Accounts -->
            <div class="flex-1-1 pa-3" style="min-width: 0">
              <p class="text-overline text-grey mb-2">Accounts</p>
              <v-data-table
                :headers="[
                  { title: 'Account ID', key: 'id', sortable: true },
                  { title: 'Modified', key: 'modifiedAt', sortable: true },
                ]"
                :items="settingsStore.userFiles"
                density="compact"
                hover
                :no-data-text="profileStore.activeProfile ? 'No account files found' : 'Select a profile'"
              >
                <template #item.modifiedAt="{ item }: { item: UserFile }">
                  {{ formatDate(item.modifiedAt) }}
                </template>
              </v-data-table>
            </div>
          </div>

          <!-- Action bar -->
          <v-toolbar density="compact" color="surface-variant" elevation="1">
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-content-copy"
              class="ml-3"
              :disabled="!profileStore.activeProfile"
            >
              Copy settings
            </v-btn>
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-archive-arrow-down"
              class="ml-2"
              :disabled="!profileStore.activeProfile"
              @click="openBackupDialog()"
            >
              Backup
            </v-btn>
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-folder-open-outline"
              class="ml-2"
              :disabled="!serverStore.activeServer"
              @click="openServerFolder()"
            >
              Open folder
            </v-btn>
          </v-toolbar>

        </div>
      </div>
    </v-main>

    <!-- ── Backup name dialog ───────────────────────────────────── -->
    <v-dialog v-model="backupDialog" max-width="400" @keydown.enter="confirmBackup">
      <v-card title="Save backup">
        <v-card-text>
          <v-text-field
            v-model="backupName"
            label="Backup name"
            autofocus
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="backupDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" :disabled="!backupName.trim()" @click="confirmBackup">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
.fill-height {
  height: 100%;
}
</style>
