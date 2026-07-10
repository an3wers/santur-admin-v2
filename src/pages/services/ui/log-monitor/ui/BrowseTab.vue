<script setup lang="ts">
import {
  NSpace,
  NCard,
  NSelect,
  NInput,
  NButton,
  NIcon,
  NTag,
  NTable,
  NSpin,
  NEmpty,
  NDatePicker,
  NPagination,
  useMessage
} from 'naive-ui'
import { Refresh } from '@vicons/tabler'
import { useLogQueryApi } from '~/entities/services'
import type { LogEvent } from '~/entities/services'
import { useLogFilters } from '../model/use-log-filters'
import { levelTagType, sourceTagType, formatTime, formatCtx, isErrorLevel } from '../lib/log-format'

const emit = defineEmits<{
  (e: 'open-session', sessionId: string): void
}>()

const api = useLogQueryApi()
const message = useMessage()
const { level, eventPrefix, sessionId, userId, release, source, filters, reset } = useLogFilters()

const events = ref<LogEvent[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(50)

// Диапазон по умолчанию — с начала текущих суток до «сейчас».
function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
const range = ref<[number, number]>([startOfToday(), Date.now()])

const isoStart = computed(() => new Date(range.value[0]).toISOString())
const isoEnd = computed(() => new Date(range.value[1]).toISOString())

async function loadPage() {
  loading.value = true
  try {
    events.value = await api.getLogPage(
      filters.value,
      isoStart.value,
      isoEnd.value,
      page.value,
      pageSize.value
    )
  } catch (e) {
    message.error('Не удалось загрузить логи')
    console.error('[log-monitor] browse page load failed', e)
  } finally {
    loading.value = false
  }
}

async function loadCount() {
  try {
    total.value = await api.getLogCount(filters.value, isoStart.value, isoEnd.value)
  } catch (e) {
    total.value = 0
    console.error('[log-monitor] browse count load failed', e)
  }
}

// Новый поиск: сбрасываем на первую страницу и обновляем и счётчик, и данные.
function search() {
  page.value = 1
  loadCount()
  loadPage()
}

function onPageChange(p: number) {
  page.value = p
  loadPage()
}

function onPageSizeChange(size: number) {
  pageSize.value = size
  page.value = 1
  loadPage()
}

function resetAll() {
  reset()
  range.value = [startOfToday(), Date.now()]
  // reset() правит query string; ждём применения, затем ищем.
  nextTick(search)
}

// Уровни-пилюли (одиночный тумблер): клик по активной снимает фильтр.
const levelPills = [
  { value: 'debug', label: 'DEBUG' },
  { value: 'info', label: 'INFO' },
  { value: 'warn', label: 'WARN' },
  { value: 'error', label: 'ERROR' }
] as const

function toggleLevel(value: string) {
  level.value = level.value === value ? '' : value
}

const sourceOptions = [
  { label: 'Все источники', value: '' },
  { label: 'client', value: 'client' },
  { label: 'server', value: 'server' }
]

// Автопоиск при изменении фильтров — с задержкой, чтобы не бить по каждому символу.
watchDebounced(filters, search, { deep: true, debounce: 500 })

onMounted(search)
</script>

<template>
  <n-space vertical size="large">
    <n-card size="small">
      <div class="toolbar">
        <div class="toolbar-filters">
          <n-date-picker
            v-model:value="range"
            type="daterange"
            format="dd-MM-yyyy HH:mm"
            :first-day-of-week="0"
            style="width: 340px"
            @update:value="search"
          />

          <div class="level-pills">
            <button
              v-for="p in levelPills"
              :key="p.value"
              type="button"
              class="level-pill"
              :class="[`level-pill--${p.value}`, { active: level === p.value }]"
              @click="toggleLevel(p.value)"
            >
              {{ p.label }}
            </button>
          </div>

          <n-input v-model:value="eventPrefix" placeholder="event: префикс*" style="width: 190px" />
          <n-input v-model:value="sessionId" placeholder="sessionId" style="width: 170px" />
          <n-input v-model:value="userId" placeholder="userId" style="width: 110px" />
          <n-input v-model:value="release" placeholder="release" style="width: 110px" />
          <div style="width: 150px">
            <n-select v-model:value="source" :options="sourceOptions" placeholder="source: все" />
          </div>
        </div>

        <div class="toolbar-status">
          <n-button secondary type="primary" size="small" @click="search">
            <template #icon>
              <n-icon><Refresh /></n-icon>
            </template>
          </n-button>
          <n-button quaternary size="small" @click="resetAll">Сбросить</n-button>
        </div>
      </div>
    </n-card>

    <n-spin :show="loading">
      <n-table v-if="events.length" :single-line="false" size="small" class="events-table">
        <thead>
          <tr>
            <th style="width: 130px">Время</th>
            <th style="width: 80px">Level</th>
            <th style="width: 260px">Event</th>
            <th style="width: 80px">Src</th>
            <th style="width: 90px">UserId</th>
            <th style="width: 200px">URL</th>
            <th>Ctx</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(ev, i) in events"
            :key="i"
            :class="{ 'row-error': isErrorLevel(ev.level), clickable: !!ev.sessionId }"
            @click="ev.sessionId && emit('open-session', String(ev.sessionId))"
          >
            <td>{{ formatTime(ev._time ?? ev.ts) }}</td>
            <td>
              <n-tag :type="levelTagType(ev.level)" size="small" :bordered="false">
                {{ ev.level }}
              </n-tag>
            </td>
            <td class="mono event-cell">{{ ev._msg }}</td>
            <td>
              <n-tag :type="sourceTagType(ev.source)" size="small" :bordered="false">
                {{ ev.source }}
              </n-tag>
            </td>
            <td>{{ ev.userId ?? '—' }}</td>
            <td class="mono url-cell">{{ ev.url ?? '—' }}</td>
            <td class="mono ctx-cell">{{ formatCtx(ev) }}</td>
          </tr>
        </tbody>
      </n-table>
      <n-empty v-else description="Событий за период не найдено" style="padding: 2rem" />
    </n-spin>

    <div v-if="total" class="pager">
      <n-pagination
        :page="page"
        :page-size="pageSize"
        :item-count="total"
        :page-slot="7"
        show-quick-jumper
        show-size-picker
        :page-sizes="[50, 100, 200]"
        @update:page="onPageChange"
        @update:page-size="onPageSizeChange"
      />
      <span class="pager-total">Всего: {{ total.toLocaleString('ru-RU') }}</span>
    </div>
  </n-space>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-filters,
.toolbar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Уровни-пилюли */
.level-pills {
  display: flex;
  gap: 6px;
}

.level-pill {
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--n-border-color, #e0e0e6);
  background: transparent;
  color: #8a8a92;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.15s ease;
}

.level-pill:hover {
  border-color: currentColor;
}

.level-pill.active {
  color: #fff;
  border-color: transparent;
}

.level-pill--debug.active {
  background: #8a8a92;
}
.level-pill--info.active {
  background: #2080f0;
}
.level-pill--warn.active {
  background: #8a6d00;
}
.level-pill--error.active {
  background: #d03050;
}

/* Таблица */
.events-table {
  font-size: 13px;
}

.mono {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.event-cell {
  font-weight: 500;
}

.url-cell,
.ctx-cell {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8a8a92;
}

.row-error td {
  background-color: rgba(208, 48, 80, 0.08);
}

.clickable {
  cursor: pointer;
}

.clickable:hover td {
  background-color: rgba(25, 118, 210, 0.08);
}

.row-error.clickable:hover td {
  background-color: rgba(208, 48, 80, 0.14);
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0;
}

.pager-total {
  font-size: 12px;
  color: #8a8a92;
  white-space: nowrap;
}
</style>
