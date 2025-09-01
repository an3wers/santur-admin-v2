<script setup lang="ts">
import { NCard, NIcon, NButton, NSpace } from 'naive-ui'
import type { ClientProjectDetailDto } from '../api/types'
import { File } from '@vicons/tabler'

defineProps<{
  files: ClientProjectDetailDto['files']
}>()
</script>

<template>
  <n-card title="Файлы">
    <n-space vertical>
      <n-button v-for="file in files" :key="file.fileUID" type="primary" text>
        <template #icon>
          <n-icon size="24px">
            <File />
          </n-icon>
        </template>
        {{ file.fileName }}
      </n-button>
      <n-button v-for="file in files" :key="file.fileUID" type="primary" text>
        <template #icon>
          <n-icon size="24px">
            <File />
          </n-icon>
        </template>
        {{ file.fileName }}
      </n-button>
    </n-space>
  </n-card>
</template>

<style scoped>
.n-list-item-row {
  display: flex;
  align-items: start;
  gap: 0.5rem;
}

.n-list-item-row .item-icon {
  flex-shrink: 0;
  line-height: 1;
}
</style>
