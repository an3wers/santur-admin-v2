<script setup lang="ts">
import { NCard, NIcon, NSpace, NText } from 'naive-ui'
import type { ClientProjectDetailDto } from '../api/types'
import { FileText } from '@vicons/tabler'

const props = defineProps<{
  files: ClientProjectDetailDto['files']
}>()
</script>

<template>
  <n-card title="Файлы">
    <n-text v-if="files.length === 0"> Файлы не добавлены </n-text>
    <n-space v-else vertical>
      <ul class="file-list">
        <li v-for="file in files" :key="file.fileUID" class="file-list__item">
          <nuxt-link
            :to="file.staticPath"
            target="_blank"
            :download="file.fileName"
            class="file-list__link"
          >
            <n-icon size="24px">
              <FileText />
            </n-icon>
            <span>{{ file.fileName }}</span>
          </nuxt-link>
        </li>
      </ul>
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

.file-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-list__item {
}

.file-list__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}
</style>
