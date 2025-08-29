<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import { ClientProjectsList } from '~/features/client-projects'
import { useNavStore } from '~/shared/navigation/model/use-nav-store'

const navStore = useNavStore()
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
          <!-- <n-button type="primary" @click="showUploadFileModal = true">Загрузить описание</n-button> -->
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
