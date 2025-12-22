<script setup lang="ts">
import { NCard, NIcon, NButton, NSpace, NText } from 'naive-ui'
import type { ClientProjectDetailDto } from '../api/types'
import { FileText } from '@vicons/tabler'

const props = defineProps<{
  files: ClientProjectDetailDto['files']
}>()
const { apiBase, santurS3Url } = useRuntimeConfig().public

async function downloadFile(file: ClientProjectDetailDto['files'][number]) {
  try {
    const replacedPath = file.getPath.replace(new RegExp(santurS3Url as string, 'i'), '')

    const res = await $fetch<unknown>(`/s3${replacedPath}`, {
      baseURL: apiBase as string
    })

    let blob: Blob | undefined

    if (res instanceof Blob) {
      blob = res
    } else if (res instanceof ArrayBuffer) {
      blob = new Blob([res])
    } else if (typeof res === 'string') {
      blob = new Blob([res])
    } else if (res instanceof Object) {
      blob = new Blob([JSON.stringify(res)])
    }

    if (!blob) {
      throw new Error('Не удалось получить файл')
    }

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName
    a.click()

    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.log(error)
  }
}

function handleFileClick(event: Event) {
  const target = event.target as HTMLElement
  const button = target.closest('[data-file-uid]') as HTMLElement
  if (button) {
    const fileUID = button.dataset.fileUid
    const file = props.files.find((f) => f.fileUID === fileUID)

    if (file) {
      downloadFile(file)
    }
  }
}
</script>

<template>
  <n-card title="Файлы">
    <n-text v-if="files.length === 0"> Файлы не добавлены </n-text>
    <n-space v-else vertical @click="handleFileClick">
      <n-button
        v-for="file in files"
        type="primary"
        text
        attr-type="button"
        :key="file.fileUID"
        :data-file-uid="file.fileUID"
      >
        <template #icon>
          <n-icon size="24px">
            <FileText />
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
