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
  NText,
  useMessage
} from 'naive-ui'
import { Refresh, PlayerPlay, PlayerPause } from '@vicons/tabler'
import { useLogQueryApi } from '~/entities/services'
import type { LogEvent } from '~/entities/services'
import { useLogFilters } from '../model/use-log-filters'
import { useLivePolling } from '../model/use-live-polling'
import { levelTagType, sourceTagType, formatTime, isErrorLevel } from '../lib/log-format'

const emit = defineEmits<{
  (e: 'open-session', sessionId: string): void
}>()

const api = useLogQueryApi()
const message = useMessage()
const { level, eventPrefix, sessionId, userId, release, source, filters, reset } = useLogFilters()

const events = ref<LogEvent[]>([])
const loading = ref(false)
let wasOk = true

async function load(manual = false) {
  loading.value = true
  try {
    events.value = await api.getLiveTail(filters.value, 100)
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

const levelOptions = [
  { label: 'Все уровни', value: '' },
  { label: 'error', value: 'error' },
  { label: 'warn', value: 'warn' },
  { label: 'info', value: 'info' },
  { label: 'debug', value: 'debug' }
]

const sourceOptions = [
  { label: 'Все источники', value: '' },
  { label: 'client', value: 'client' },
  { label: 'server', value: 'server' }
]

const { enabled, toggle } = useLivePolling(() => load(false), 5000)

// Перезагрузка при изменении фильтров.
const stopWatch = watch(filters, () => load(true), { deep: true })

onMounted(() => load(true))
onBeforeUnmount(() => stopWatch())
</script>

<template>
  <n-space vertical size="large">
    <n-card size="small">
      <n-space align="center">
        <div style="width: 140px">
          <n-select v-model:value="level" :options="levelOptions" placeholder="Уровень" />
        </div>
        <n-input v-model:value="eventPrefix" placeholder="Событие (префикс)" style="width: 200px" />
        <n-input v-model:value="sessionId" placeholder="sessionId" style="width: 180px" />
        <n-input v-model:value="userId" placeholder="userId" style="width: 120px" />
        <n-input v-model:value="release" placeholder="release" style="width: 120px" />
        <div style="width: 140px">
          <n-select v-model:value="source" :options="sourceOptions" placeholder="Источник" />
        </div>

        <n-button :type="enabled ? 'warning' : 'success'" secondary @click="toggle">
          <template #icon>
            <n-icon><PlayerPause v-if="enabled" /><PlayerPlay v-else /></n-icon>
          </template>
          {{ enabled ? 'Пауза' : 'Играть' }}
        </n-button>
        <n-button secondary type="primary" @click="load(true)">
          <template #icon>
            <n-icon><Refresh /></n-icon>
          </template>
        </n-button>
        <n-button quaternary @click="reset">Сбросить</n-button>
      </n-space>
    </n-card>

    <n-space align="center" size="small">
      <n-tag :type="enabled ? 'success' : 'default'" size="small" :bordered="false">
        {{ enabled ? 'Автообновление 5с' : 'Остановлено' }}
      </n-tag>
      <n-text depth="3">Показано событий: {{ events.length }}</n-text>
    </n-space>

    <n-spin :show="loading">
      <n-table v-if="events.length" :single-line="false" size="small" class="events-table">
        <thead>
          <tr>
            <th style="width: 150px">Время</th>
            <th style="width: 80px">Уровень</th>
            <th>Событие</th>
            <th style="width: 90px">Источник</th>
            <th>URL</th>
            <th style="width: 170px">sessionId</th>
            <th style="width: 90px">userId</th>
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
            <td class="mono">{{ ev._msg }}</td>
            <td>
              <n-tag :type="sourceTagType(ev.source)" size="small" :bordered="false">
                {{ ev.source }}
              </n-tag>
            </td>
            <td class="mono url-cell">{{ ev.url ?? '—' }}</td>
            <td class="mono">{{ ev.sessionId }}</td>
            <td>{{ ev.userId ?? '—' }}</td>
          </tr>
        </tbody>
      </n-table>
      <n-empty v-else description="Событий не найдено" style="padding: 2rem" />
    </n-spin>
  </n-space>
</template>

<style scoped>
.events-table {
  font-size: 13px;
}

.mono {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.url-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>
