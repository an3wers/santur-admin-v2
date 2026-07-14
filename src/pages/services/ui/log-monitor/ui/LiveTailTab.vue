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
  useMessage
} from 'naive-ui'
import { Refresh, PlayerPlay, PlayerPause } from '@vicons/tabler'
import { useLogQueryApi } from '~/entities/services'
import type { LogEvent } from '~/entities/services'
import { useLogFilters } from '../model/use-log-filters'
import { useLivePolling } from '../model/use-live-polling'
import { levelTagType, sourceTagType, formatTime, formatCtx, isErrorLevel } from '../lib/log-format'

const emit = defineEmits<{
  (e: 'open-session', sessionId: string): void
}>()

const api = useLogQueryApi()
const message = useMessage()
const { level, eventPrefix, sessionId, userId, release, source, filters, reset } = useLogFilters()

const events = ref<LogEvent[]>([])
const loading = ref(false)
let wasOk = true

const LIMIT = 100
const POLL_MS = 5000

async function load(manual = false) {
  loading.value = true
  try {
    events.value = await api.getLiveTail(filters.value, LIMIT)
    wasOk = true
  } catch (e) {
    // Показываем ошибку только при ручном обновлении или первом падении подряд.
    if (manual || wasOk) message.error('Не удалось загрузить события')
    wasOk = false
    console.error('[log-monitor] live tail load failed', e)
  } finally {
    loading.value = false
  }
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

const { enabled, toggle } = useLivePolling(() => load(false), POLL_MS)

// Перезагрузка при изменении фильтров.
const stopWatch = watch(filters, () => load(true), { deep: true })

onMounted(() => load(true))
onBeforeUnmount(() => stopWatch())
</script>

<template>
  <n-space vertical size="large">
    <n-card size="small">
      <div class="toolbar">
        <div class="toolbar-filters">
          <n-space size="small" class="level-tags">
            <n-tag
              v-for="p in levelPills"
              :key="p.value"
              checkable
              :checked="level === p.value"
              size="small"
              @update:checked="toggleLevel(p.value)"
            >
              {{ p.label }}
            </n-tag>
          </n-space>

          <n-input v-model:value="eventPrefix" placeholder="event: префикс*" style="width: 200px" />
          <n-input v-model:value="sessionId" placeholder="sessionId" style="width: 170px" />
          <n-input v-model:value="userId" placeholder="userId" style="width: 110px" />
          <n-input v-model:value="release" placeholder="release" style="width: 110px" />
          <div style="width: 150px">
            <n-select v-model:value="source" :options="sourceOptions" placeholder="source: все" />
          </div>
        </div>

        <div class="toolbar-status">
          <span class="live" :class="{ paused: !enabled }">
            <span class="live-dot" />
            {{ enabled ? 'LIVE · 5с' : 'Пауза' }}
          </span>
          <n-button :type="enabled ? 'warning' : 'success'" secondary size="small" @click="toggle">
            <template #icon>
              <n-icon><PlayerPause v-if="enabled" /><PlayerPlay v-else /></n-icon>
            </template>
            {{ enabled ? 'Пауза' : 'Играть' }}
          </n-button>
          <n-button secondary type="primary" size="small" @click="load(true)">
            <template #icon>
              <n-icon><Refresh /></n-icon>
            </template>
          </n-button>
          <n-button quaternary size="small" @click="reset">Сбросить</n-button>
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
      <n-empty v-else description="Событий не найдено" style="padding: 2rem" />
    </n-spin>

    <div class="tail-hint">↑ новые события сверху · polling 5с · limit {{ LIMIT }}</div>
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

/* LIVE-индикатор */
.live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #18a058;
  background: rgba(24, 160, 88, 0.12);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #18a058;
  box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.5);
  animation: pulse 1.6s infinite;
}

.live.paused {
  color: #8a8a92;
  background: rgba(138, 138, 146, 0.12);
}

.live.paused .live-dot {
  background: #8a8a92;
  animation: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.5);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(24, 160, 88, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 160, 88, 0);
  }
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

.tail-hint {
  text-align: center;
  font-size: 12px;
  color: #8a8a92;
  padding: 4px 0;
}
</style>
