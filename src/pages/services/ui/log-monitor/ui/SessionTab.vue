<script setup lang="ts">
import {
  NSpace,
  NCard,
  NInput,
  NButton,
  NIcon,
  NSpin,
  NEmpty,
  NTag,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui'
import { Search } from '@vicons/tabler'
import { useLogQueryApi } from '~/entities/services'
import type { LogEvent } from '~/entities/services'
import { levelTagType, sourceTagType, formatTime, isErrorLevel } from '../lib/log-format'

const sessionId = defineModel<string>('sessionId', { default: '' })

const api = useLogQueryApi()
const message = useMessage()

const events = ref<LogEvent[]>([])
const loading = ref(false)
const loadedFor = ref('')

async function load() {
  const id = sessionId.value.trim()
  if (!id) {
    message.warning('Укажите sessionId')
    return
  }
  loading.value = true
  try {
    events.value = await api.getSessionTrace(id)
    loadedFor.value = id
  } catch (e) {
    message.error('Не удалось загрузить сессию')
    console.error('[log-monitor] session load failed', e)
  } finally {
    loading.value = false
  }
}

function timelineType(level?: string) {
  if (isErrorLevel(level)) return 'error'
  if (level === 'warn') return 'warning'
  return 'info'
}

function formatCtx(ctx: unknown): string {
  if (ctx == null) return ''
  try {
    return JSON.stringify(ctx, null, 2)
  } catch {
    return String(ctx)
  }
}

// Автозагрузка при открытии сессии из другой вкладки.
watch(
  sessionId,
  (id) => {
    if (id && id !== loadedFor.value) load()
  },
  { immediate: true }
)
</script>

<template>
  <n-space vertical size="large">
    <n-card size="small">
      <n-space align="center">
        <n-input
          v-model:value="sessionId"
          placeholder="sessionId сессии"
          style="width: 320px"
          @keyup.enter="load"
        />
        <n-button type="primary" secondary @click="load">
          <template #icon>
            <n-icon><Search /></n-icon>
          </template>
          Показать
        </n-button>
      </n-space>
    </n-card>

    <n-spin :show="loading">
      <n-card v-if="events.length" size="small" :title="`Сессия ${loadedFor}`">
        <n-timeline>
          <n-timeline-item
            v-for="(ev, i) in events"
            :key="i"
            :type="timelineType(ev.level)"
            :time="formatTime(ev._time ?? ev.ts)"
          >
            <template #header>
              <n-space align="center" size="small">
                <span class="event-name">{{ ev._msg }}</span>
                <n-tag :type="levelTagType(ev.level)" size="tiny" :bordered="false">
                  {{ ev.level }}
                </n-tag>
                <n-tag :type="sourceTagType(ev.source)" size="tiny" :bordered="false">
                  {{ ev.source }}
                </n-tag>
              </n-space>
            </template>
            <div v-if="ev.url" class="event-url">{{ ev.url }}</div>
            <pre v-if="ev.ctx && Object.keys(ev.ctx).length" class="event-ctx">{{
              formatCtx(ev.ctx)
            }}</pre>
          </n-timeline-item>
        </n-timeline>
      </n-card>
      <n-empty
        v-else
        :description="loadedFor ? 'Событий по сессии не найдено' : 'Укажите sessionId сессии'"
        style="padding: 2rem"
      />
    </n-spin>
  </n-space>
</template>

<style scoped>
.event-name {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  font-size: 13px;
}

.event-url {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.event-ctx {
  margin: 4px 0 0;
  padding: 8px 10px;
  background: #f6f8fa;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
