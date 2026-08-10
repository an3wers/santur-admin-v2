<script setup lang="ts">
import { useAnalyticsApi } from '../../api/analytics-api'
import { formatRangeDate } from '../libs/format-range-date'
import { NSpace, NButton, NIcon, NDatePicker, NSelect, useMessage } from 'naive-ui'
import { Download } from '@vicons/tabler'

const { range, source, state, sourceOptions } = defineProps<{
  range: [number, number]
  source: string
  state: string
  sourceOptions: Record<string, string>[]
  statusesOptions: Record<string, string>[]
}>()

const localRange = ref(range)
const localSource = ref(source)
const localState = ref(state)

const status = ref<ProcessStatus>('idle')

const message = useMessage()

const api = useAnalyticsApi()

let abortSignal: AbortController

async function saveExcelHandler() {
  try {
    status.value = 'pending'
    abortSignal = new AbortController()
    const res = (await api.getOrdersToExcel(
      {
        period: formatRangeDate(localRange.value),
        source: localSource.value,
        state: localState.value
      },
      abortSignal.signal
    )) as Blob | undefined

    status.value = 'success'

    if (res && res instanceof Blob) {
      const url = URL.createObjectURL(res)

      const a = document.createElement('a')
      a.href = url
      a.download = `orders_${Date.now()}.xlsx`
      a.click()

      URL.revokeObjectURL(url)
    }
  } catch (error) {
    if (error instanceof Error && error.cause === 'window closed') {
      console.log('Запрос отменен')
    } else {
      console.error(error)
      status.value = 'error'
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
      <div class="row-filters__item">
        <n-select
          v-model:value="localSource"
          :options="sourceOptions"
          :disabled="status === 'pending'"
        />
      </div>
      <div class="row-filters__item">
        <n-select
          v-model:value="localState"
          :options="statusesOptions"
          :disabled="status === 'pending'"
        />
      </div>
      <div class="row-filters__item">
        <n-date-picker
          v-model:value="localRange"
          type="daterange"
          format="dd-MM-yyyy"
          :disabled="status === 'pending'"
          :first-day-of-week="0"
        />
      </div>
    </div>
    <div class="row-controls">
      <n-button @click="saveExcelHandler" type="primary" :loading="status === 'pending'">
        <template #icon>
          <n-icon>
            <Download />
          </n-icon>
        </template>
        {{ status === 'pending' ? 'Подготовка...' : 'Скачать' }}
      </n-button>
    </div>
  </n-space>
</template>

<style scoped>
.row-filters {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.row-filters .row-filters__item {
  min-width: 200px;
}

.row-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
