<script setup lang="ts">
import { NSpace, NSelect, NDatePicker, NButton, NIcon, useMessage } from 'naive-ui'
import { Download } from '@vicons/tabler'
import { useAnalyticsApi } from '../../api/analytics-api'
import { formatDateForServer } from '~/shared/libs/format-date-for-server'

const { range, ownerId, owners } = defineProps<{
  range: [number, number]
  ownerId: 100000 | 100002 | 100005
  owners: { label: string; value: number }[]
}>()

const localRange = ref(range)
const localOwnerId = ref(ownerId)

const downloadStatus = ref<ProcessStatus>('idle')
const { getReportSummaryClientsToExcel } = useAnalyticsApi()
const message = useMessage()

let abortSignal: AbortController

async function downloadReport() {
  try {
    downloadStatus.value = 'pending'

    abortSignal = new AbortController()

    const blob = await getReportSummaryClientsToExcel(
      {
        ownerId: localOwnerId.value,
        leftDate: formatDateForServer(new Date(localRange.value[0])),
        rightDate: formatDateForServer(new Date(localRange.value[1]))
      },
      abortSignal.signal
    )

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients_${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)

    message.success('Отчет скачан')
    downloadStatus.value = 'success'
  } catch (error) {
    if (error instanceof Error && error.cause === 'window closed') {
      console.log('Запрос отменен')
    } else {
      console.error(error)
      downloadStatus.value = 'error'
      message.error('При скачивании отчета произошла ошибка')
    }
  }
}

onBeforeUnmount(() => {
  abortSignal?.abort('window closed')
})
</script>

<template>
  <n-space vertical size="large" justify="center">
    <div class="row-filters">
      <div>
        <n-select
          v-model:value="localOwnerId"
          :options="owners"
          :disabled="downloadStatus === 'pending'"
        />
      </div>
      <div>
        <n-date-picker
          v-model:value="localRange"
          type="daterange"
          format="dd-MM-yyyy"
          :disabled="downloadStatus === 'pending'"
          :first-day-of-week="0"
        />
      </div>
    </div>
    <div class="row-controls">
      <n-button @click="downloadReport" type="primary" :loading="downloadStatus === 'pending'">
        <template #icon>
          <n-icon>
            <Download />
          </n-icon>
        </template>
        {{ downloadStatus === 'pending' ? 'Подготовка...' : 'Скачать' }}
      </n-button>
    </div>
  </n-space>
</template>

<style scoped>
.row-filters {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.row-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
