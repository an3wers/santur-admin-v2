<script setup lang="ts">
import {
  NGrid,
  NGi,
  NCard,
  NSpace,
  NDatePicker,
  NButton,
  NIcon,
  NSpin,
  NEmpty,
  NTable,
  NTag,
  useMessage
} from 'naive-ui'
import { Refresh } from '@vicons/tabler'
import type { ChartData, ChartOptions } from 'chart.js'
import LineChart from '~/shared/ui/charts/LineChart.vue'
import KpiCard from './KpiCard.vue'
import DomainBars from './DomainBars.vue'
import { useLogQueryApi } from '~/entities/services'
import type { ErrorRatePoint, KpiPoint, DomainErrorRow, TopErrorRow } from '~/entities/services'
import { useLogRange } from '../model/use-log-range'
import { formatShortTime, levelTagType } from '../lib/log-format'

const emit = defineEmits<{
  (e: 'open-event', payload: { event: string; level: string }): void
  (e: 'open-session', sessionId: string): void
}>()

const api = useLogQueryApi()
const message = useMessage()

const { range } = useLogRange()

const loading = ref(false)
const failed = ref(false)
const kpiSeries = ref<KpiPoint[]>([])
const errorRate = ref<ErrorRatePoint[]>([])
const domains = ref<DomainErrorRow[]>([])
const topErrors = ref<TopErrorRow[]>([])

// Конфиг KPI-карточек (ключ соответствует полю KpiPoint).
const KPIS = [
  { key: 'errors', label: 'level:error', color: '#d03050' },
  { key: 'network', label: 'network.error', color: '#f0a020' },
  { key: 'order', label: 'checkout.order.failed', color: '#2080f0' },
  { key: 'js', label: 'js.error', color: '#8a63d2' }
] as const

const KPI_FOOTER = 'за 24 ч · бакет 1 ч'

const LIMIT = 30

async function load() {
  loading.value = true
  failed.value = false
  const start = new Date(range.value[0]).toISOString()
  const end = new Date(range.value[1]).toISOString()
  try {
    const [kpi, rate, dom, top] = await Promise.all([
      api.getKpiSeries(start, end),
      api.getErrorRate(start, end),
      api.getErrorsByDomain(start, end),
      api.getTopErrors(start, end, LIMIT)
    ])
    kpiSeries.value = kpi
    errorRate.value = rate
    domains.value = dom
    topErrors.value = top
  } catch (e) {
    failed.value = true
    message.error('Не удалось загрузить данные обзора логов')
    console.error('[log-monitor] overview load failed', e)
  } finally {
    loading.value = false
  }
}

// Серия значений KPI по бакетам для спарклайна.
function kpiSeriesValues(key: (typeof KPIS)[number]['key']): number[] {
  return kpiSeries.value.map((p) => p[key])
}

// Крупное число KPI — сумма по бакетам за период.
function kpiTotal(key: (typeof KPIS)[number]['key']): number {
  return kpiSeries.value.reduce((sum, p) => sum + p[key], 0)
}

const chartData = computed<ChartData<'line'>>(() => ({
  labels: errorRate.value.map((p) => formatShortTime(p.time)),
  datasets: [
    {
      label: 'всего',
      data: errorRate.value.map((p) => p.total),
      borderColor: '#2080f0',
      backgroundColor: 'rgba(32, 128, 240, 0.12)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2
    },
    {
      label: 'network',
      data: errorRate.value.map((p) => p.network),
      borderColor: '#f0a020',
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 1.5
    },
    {
      label: 'js',
      data: errorRate.value.map((p) => p.js),
      borderColor: '#8a63d2',
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 1.5
    }
  ]
}))

const chartOptions: ChartOptions<'line'> = {
  plugins: { legend: { position: 'top', align: 'end' } },
  scales: {
    x: { ticks: { maxTicksLimit: 8, autoSkip: true } },
    y: { beginAtZero: true, ticks: { precision: 0 } }
  }
}

const hasChart = computed(() => errorRate.value.length > 0)

// Перезагружаем при смене общего диапазона — в т.ч. когда его меняют
// на соседней вкладке.
watch(range, load)

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
      />
      <n-button secondary type="primary" @click="load">
        <template #icon>
          <n-icon><Refresh /></n-icon>
        </template>
        Обновить
      </n-button>
    </n-space>

    <n-spin :show="loading">
      <n-space vertical size="large">
        <n-grid :x-gap="12" :y-gap="12" cols="1 640:2 1024:4" class="kpi">
          <n-gi v-for="kpi in KPIS" :key="kpi.key">
            <KpiCard
              :label="kpi.label"
              :color="kpi.color"
              :value="kpiTotal(kpi.key)"
              :series="kpiSeriesValues(kpi.key)"
              :footer="KPI_FOOTER"
            />
          </n-gi>
        </n-grid>

        <n-grid :x-gap="12" :y-gap="12" cols="1 1024:3" class="mid">
          <n-gi :span="2">
            <n-card size="small" class="mid-card">
              <template #header>
                <div class="card-head">
                  <span class="card-head__title">Error rate</span>
                  <code class="card-head__query"
                    >_time:24h level:error | stats by (_time:5m) count()</code
                  >
                </div>
              </template>
              <div v-if="hasChart" class="chart-wrap">
                <LineChart :data="chartData" :options="chartOptions" />
              </div>
              <n-empty v-else description="Нет данных за выбранный период" />
            </n-card>
          </n-gi>

          <n-gi :span="1">
            <n-card size="small" class="mid-card">
              <template #header>
                <div class="card-head">
                  <span class="card-head__title">Ошибки по доменам</span>
                  <code class="card-head__query">level:error | stats by (domain)</code>
                </div>
              </template>
              <DomainBars v-if="domains.length" :rows="domains" />
              <n-empty v-else description="Нет данных" />
            </n-card>
          </n-gi>
        </n-grid>

        <n-card size="small">
          <template #header>
            <div class="card-head card-head--row">
              <span class="card-head__title">Топ событий</span>
              <code class="card-head__query"
                >stats by (event) count() | sort by (count desc) | limit {{ LIMIT }}</code
              >
            </div>
          </template>
          <n-table v-if="topErrors.length" :single-line="false" size="small">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th>Событие</th>
                <th class="col-level">Уровень</th>
                <th class="col-num">Кол-во</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in topErrors"
                :key="row.event"
                class="clickable"
                @click="emit('open-event', { event: row.event, level: row.level })"
              >
                <td class="col-rank">{{ String(i + 1).padStart(2, '0') }}</td>
                <td>
                  <code class="event">{{ row.event }}</code>
                </td>
                <td class="col-level">
                  <n-tag :type="levelTagType(row.level)" size="small" :bordered="false">
                    {{ row.level.toUpperCase() }}
                  </n-tag>
                </td>
                <td class="col-num">{{ row.count }}</td>
              </tr>
            </tbody>
          </n-table>
          <n-empty v-else description="Ошибок за период не найдено" />
        </n-card>
      </n-space>
    </n-spin>
  </n-space>
</template>

<style scoped>
.kpi {
  margin-bottom: 1rem;
}

.mid {
  margin-bottom: 1rem;
}

.mid-card {
  height: 100%;
}

.chart-wrap {
  height: 320px;
}

.card-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-head--row {
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.card-head__title {
  font-weight: 600;
  color: #1f2a3a;
}

.card-head__query {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.75rem;
  color: #9aa4b2;
}

.event {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
}

.col-rank {
  width: 48px;
  color: #9aa4b2;
  font-variant-numeric: tabular-nums;
}

.col-level {
  width: 120px;
}

.col-num {
  text-align: right;
  width: 120px;
  font-variant-numeric: tabular-nums;
}

.clickable {
  cursor: pointer;
}

.clickable:hover td {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>
