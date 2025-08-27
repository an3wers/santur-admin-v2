<script setup lang="ts">
import { NButton, NSpace, NH1 } from 'naive-ui'
import { useNavStore } from '~/shared/navigation/model/use-nav-store'

const navStore = useNavStore()
</script>

<template>
  <div class="container">
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
    </n-space>
  </div>
</template>
