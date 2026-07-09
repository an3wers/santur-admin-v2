<script setup lang="ts">
import {
  NGrid,
  NGi,
  NCard,
  NStatistic,
  NSpace,
  NDatePicker,
  NButton,
  NIcon,
  NSpin,
  NEmpty,
  NTable,
  useMessage
} from 'naive-ui'
import { Refresh } from '@vicons/tabler'
import type { ChartData } from 'chart.js'
import LineChart from '~/shared/ui/charts/LineChart.vue'
import { useLogQueryApi } from '~/entities/services'
import type { ErrorRatePoint, OverviewCounters, TopErrorRow } from '~/entities/services'
import { formatTime } from '../lib/log-format'

const emit = defineEmits<{
  (e: 'open-event', event: string): void
  (e: 'open-session', sessionId: string): void
}>()

const api = useLogQueryApi()
const message = useMessage()

const DAY_MS = 24 * 60 * 60 * 1000
const range = ref<[number, number]>([Date.now() - DAY_MS, Date.now()])

const loading = ref(false)
const failed = ref(false)
const counters = ref<OverviewCounters>({ errors: 0, network: 0, payments: 0 })
const errorRate = ref<ErrorRatePoint[]>([])
const topErrors = ref<TopErrorRow[]>([])

async function load() {
  loading.value = true
  failed.value = false
  const start = new Date(range.value[0]).toISOString()
  const end = new Date(range.value[1]).toISOString()
  try {
    const [c, rate, top] = await Promise.all([
      api.getOverviewCounters(start, end),
      api.getErrorRate(start, end),
      api.getTopErrors(start, end, 10)
    ])
    counters.value = c
    errorRate.value = rate
    topErrors.value = top
  } catch (e) {
    failed.value = true
    message.error('Не удалось загрузить данные обзора логов')
    console.error('[log-monitor] overview load failed', e)
  } finally {
    loading.value = false
  }
}

const chartData = computed<ChartData<'line'>>(() => ({
  labels: errorRate.value.map((p) => formatTime(p.time)),
  datasets: [
    {
      label: 'Ошибки',
      data: errorRate.value.map((p) => p.count),
      borderColor: '#d03050',
      backgroundColor: 'rgba(208, 48, 80, 0.15)',
      fill: true,
      tension: 0.25,
      pointRadius: 2
    }
  ]
}))

const hasChart = computed(() => errorRate.value.length > 0)

onMounted(load)
</script>

<template>
  <n-space vertical size="large">
    <n-space align="center" justify="space-between">
      <n-date-picker
        v-model:value="range"
        type="daterange"
        format="dd-MM-yyyy HH:mm"
        :first-day-of-week="0"
        style="width: 360px"
        @update:value="load"
      />
      <n-button secondary type="primary" @click="load">
        <template #icon>
          <n-icon><Refresh /></n-icon>
        </template>
        Обновить
      </n-button>
    </n-space>

    <n-spin :show="loading">
      <n-grid :x-gap="12" :cols="3" class="kpi">
        <n-gi>
          <n-card>
            <n-statistic label="Ошибки (всего)" :value="counters.errors" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="Сетевые ошибки" :value="counters.network" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="Ошибки оплаты" :value="counters.payments" />
          </n-card>
        </n-gi>
      </n-grid>

      <n-card title="Error rate (бакеты 5 мин)" size="small" class="chart-card">
        <div v-if="hasChart" class="chart-wrap">
          <LineChart :data="chartData" />
        </div>
        <n-empty v-else description="Нет данных за выбранный период" />
      </n-card>

      <n-card title="Топ-10 ошибок" size="small">
        <n-table v-if="topErrors.length" :single-line="false" size="small">
          <thead>
            <tr>
              <th>Событие</th>
              <th class="col-num">Количество</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in topErrors"
              :key="row.event"
              class="clickable"
              @click="emit('open-event', row.event)"
            >
              <td>{{ row.event }}</td>
              <td class="col-num">{{ row.count }}</td>
            </tr>
          </tbody>
        </n-table>
        <n-empty v-else description="Ошибок за период не найдено" />
      </n-card>
    </n-spin>
  </n-space>
</template>

<style scoped>
.kpi {
  margin-bottom: 1rem;
}

.chart-card {
  margin-bottom: 1rem;
}

.chart-wrap {
  height: 280px;
}

.col-num {
  text-align: right;
  width: 160px;
}

.clickable {
  cursor: pointer;
}

.clickable:hover td {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>
