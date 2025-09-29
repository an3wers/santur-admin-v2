<script setup lang="ts">
import { NSpace, NH1, NButton, NIcon } from 'naive-ui'
import { ClientProjectsList } from '~/features/client-projects'
import { useNavStore } from '~/shared/navigation/model/use-nav-store'
import { Settings } from '@vicons/tabler'
const navStore = useNavStore()

function openSttings() {}
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
          <n-button type="default" @click="openSttings">
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
