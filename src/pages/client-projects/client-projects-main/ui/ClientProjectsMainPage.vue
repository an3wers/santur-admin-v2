<script setup lang="ts">
import { Suspense } from 'vue'
import { NSpace, NH1, NButton, NIcon, NModal, NSpin } from 'naive-ui'
import { ClientProjectsList } from '~/features/client-projects'
import { useNavStore } from '~/shared/navigation/model/use-nav-store'
import { Settings } from '@vicons/tabler'
const navStore = useNavStore()

const isShowSettings = ref(false)

function openSttings() {
  isShowSettings.value = true
}

const ClientProjectsSettings = defineAsyncComponent(
  () => import('~/features/client-projects/ui/ClientProjectsSettings.vue')
)
</script>

<template>
  <div class="projects-container">
    <n-space vertical size="large">
      <page-title back-label="Главная" has-back :back-path="`/`">
        <template #title>
          <n-h1>
            {{ navStore.currentNavigationMenu?.label }}
          </n-h1>
        </template>
        <template #actions>
          <n-button type="primary" ghost @click="openSttings">
            <template #icon>
              <n-icon size="20px">
                <Settings />
              </n-icon>
            </template>
            Настройки
          </n-button>
        </template>
      </page-title>
      <ClientProjectsList />
    </n-space>

    <n-modal
      v-model:show="isShowSettings"
      style="max-width: 1024px"
      size="medium"
      preset="card"
      title="Настройки"
    >
      <Suspense>
        <template #fallback>
          <n-spin>
            <div style="height: 100px"></div>
          </n-spin>
        </template>
        <ClientProjectsSettings @on-close="isShowSettings = false" />
      </Suspense>
    </n-modal>
  </div>
</template>

<style scoped lang="css">
.projects-container {
  height: 100%;
  margin: 0 auto;
  padding: 1rem 1rem;
  width: 100%;
}
</style>
