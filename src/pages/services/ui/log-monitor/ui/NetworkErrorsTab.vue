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
import { useLogQueryApi } from '~/entities/services'
import type { NetworkErrorRow } from '~/entities/services'
import { useLogRange } from '../model/use-log-range'
import { statusTagType, formatAgo, formatNumber } from '../lib/log-format'

const api = useLogQueryApi()
const message = useMessage()

const { range } = useLogRange()

const loading = ref(false)
const failed = ref(false)
const rows = ref<NetworkErrorRow[]>([])

const LIMIT = 100

async function load() {
  loading.value = true
  failed.value = false
  const start = new Date(range.value[0]).toISOString()
  const end = new Date(range.value[1]).toISOString()
  try {
    rows.value = await api.getNetworkErrors(start, end, LIMIT)
  } catch (e) {
    failed.value = true
    message.error('Не удалось загрузить сетевые ошибки')
    console.error('[log-monitor] network errors load failed', e)
  } finally {
    loading.value = false
  }
}

// --- Фильтр по статусу (пилюли) ---
type StatusFilter = 'all' | '5xx' | '4xx' | '429'

const statusFilter = ref<StatusFilter>('all')

const statusPills: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'все' },
  { value: '5xx', label: '5xx' },
  { value: '4xx', label: '4xx' },
  { value: '429', label: '429' }
]

function matchesFilter(status: number): boolean {
  switch (statusFilter.value) {
    case '5xx':
      return status >= 500 && status < 600
    case '4xx':
      return status >= 400 && status < 500
    case '429':
      return status === 429
    default:
      return true
  }
}

// Таблица уважает выбранный фильтр по статусу; KPI считаем по всем строкам.
const visibleRows = computed(() => rows.value.filter((r) => matchesFilter(r.status)))

// --- KPI ---
const totalCount = computed(() => rows.value.reduce((sum, r) => sum + r.count, 0))
const uniqueEndpoints = computed(() => new Set(rows.value.map((r) => r.urlPath)).size)
const worstStatus = computed(() => rows.value.reduce((max, r) => Math.max(max, r.status), 0))

// Доля — длина бара относительно самого частого статуса в видимой выборке.
const maxVisibleCount = computed(() =>
  visibleRows.value.reduce((m, r) => Math.max(m, r.count), 0)
)

function shareWidth(count: number): string {
  return `${Math.max((count / (maxVisibleCount.value || 1)) * 100, 2)}%`
}

// Цвет: метод — GET зелёный / POST синий; бар и время ответа — по «тяжести».
function methodClass(method: string): string {
  return `method--${method.toLowerCase()}`
}

function barColor(status: number): string {
  if (status >= 500) return '#d03050'
  if (status === 429 || status === 401) return '#e0a020'
  return '#94a3b8'
}

// Перезагружаем при смене общего диапазона (в т.ч. правка на других вкладках).
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

    <n-grid :x-gap="12" :y-gap="12" cols="1 640:2 1024:4" class="kpi">
      <n-gi>
        <n-card size="small" class="stat">
          <div class="stat__label">network.error · период</div>
          <div class="stat__value stat__value--bad">{{ formatNumber(totalCount) }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card size="small" class="stat">
          <div class="stat__label">уникальных эндпоинтов</div>
          <div class="stat__value">{{ uniqueEndpoints }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card size="small" class="stat">
          <div class="stat__label">худший статус</div>
          <div class="stat__value" :class="{ 'stat__value--bad': worstStatus >= 500 }">
            {{ worstStatus || '—' }}
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card size="small" class="stat">
          <div class="stat__label">фильтр по статусу</div>
          <n-space size="small" class="status-tags">
            <n-tag
              v-for="p in statusPills"
              :key="p.value"
              checkable
              :checked="statusFilter === p.value"
              size="small"
              @update:checked="statusFilter = p.value"
            >
              {{ p.label }}
            </n-tag>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <n-card size="small">
      <template #header>
        <div class="card-head">
          <span class="card-head__title">Сетевые ошибки · urlPath × status</span>
          <code class="card-head__query"
            >event:network.error | stats by (ctx.urlPath, ctx.status) count()</code
          >
        </div>
      </template>

      <n-spin :show="loading">
        <n-table v-if="visibleRows.length" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="col-method">Метод</th>
              <th>Путь</th>
              <th class="col-status">Статус</th>
              <th class="col-num">Кол-во</th>
              <th class="col-share">Доля</th>
              <th class="col-last">Посл.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in visibleRows" :key="i">
              <td class="col-method">
                <span class="method" :class="methodClass(row.method)">{{ row.method || '—' }}</span>
              </td>
              <td>
                <code class="path">{{ row.urlPath || '—' }}</code>
              </td>
              <td class="col-status">
                <n-tag :type="statusTagType(row.status)" size="small" :bordered="false">
                  {{ row.status || '—' }}
                </n-tag>
              </td>
              <td class="col-num">{{ formatNumber(row.count) }}</td>
              <td class="col-share">
                <div class="share-track">
                  <div
                    class="share-fill"
                    :style="{ width: shareWidth(row.count), backgroundColor: barColor(row.status) }"
                  />
                </div>
              </td>
              <td class="col-last">{{ formatAgo(row.lastTime) }}</td>
            </tr>
          </tbody>
        </n-table>
        <n-empty
          v-else
          :description="
            rows.length ? 'Нет строк под выбранный статус' : 'Сетевых ошибок за период не найдено'
          "
          style="padding: 2rem"
        />
      </n-spin>
    </n-card>
  </n-space>
</template>

<style scoped>
.kpi {
  margin-bottom: 0.25rem;
}

.stat__label {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: #9aa4b2;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.stat__value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1f2a3a;
  font-variant-numeric: tabular-nums;
}

.stat__value--bad {
  color: #d03050;
}

/* Пилюли фильтра по статусу (naive-ui NTag checkable) */
.status-tags {
  margin-top: 2px;
}

/* Заголовок карточки таблицы */
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
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

/* Таблица */
.method {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  font-weight: 700;
}

.method--get {
  color: #18a058;
}

.method--post {
  color: #2080f0;
}

.method--put,
.method--patch {
  color: #e0a020;
}

.method--delete {
  color: #d03050;
}

.path {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  color: #1f2a3a;
}

.col-method {
  width: 84px;
}

.col-status {
  width: 96px;
}

.col-num {
  text-align: right;
  width: 108px;
  font-variant-numeric: tabular-nums;
}

.col-share {
  width: 200px;
}

.col-last {
  width: 84px;
  text-align: right;
  color: #9aa4b2;
  font-variant-numeric: tabular-nums;
}

.share-track {
  height: 6px;
  border-radius: 3px;
  background-color: #f1f5f9;
  overflow: hidden;
}

.share-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
</style>
