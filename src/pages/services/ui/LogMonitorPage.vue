<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import { useActiveTab, useLogFilters } from './log-monitor/model/use-log-filters'
import OverviewTab from './log-monitor/ui/OverviewTab.vue'
import LiveTailTab from './log-monitor/ui/LiveTailTab.vue'
import SessionTab from './log-monitor/ui/SessionTab.vue'

const activeTab = useActiveTab('overview')
const { eventPrefix, sessionId: filterSessionId } = useLogFilters()

// sessionId для экрана «Сессия» (из клика по строке в других вкладках).
const sessionId = ref(filterSessionId.value)

// Открыть трейс сессии (ТЗ: до конкретной сессии ≤ 3 клика).
function openSession(id: string) {
  if (!id) return
  sessionId.value = id
  activeTab.value = 'session'
}

// Провалиться в Live tail с фильтром по событию (клик из «Обзора»).
function openLiveTailEvent(event: string) {
  eventPrefix.value = event
  activeTab.value = 'livetail'
}
</script>

<template>
  <div class="log-monitor">
    <h1 class="log-monitor__title">Лог-монитор</h1>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="overview" tab="Обзор">
        <OverviewTab @open-session="openSession" @open-event="openLiveTailEvent" />
      </n-tab-pane>

      <n-tab-pane name="livetail" tab="Live tail">
        <LiveTailTab @open-session="openSession" />
      </n-tab-pane>

      <n-tab-pane name="session" tab="Сессия">
        <SessionTab v-model:session-id="sessionId" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style scoped>
.log-monitor {
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.log-monitor__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2a3a;
}
</style>
