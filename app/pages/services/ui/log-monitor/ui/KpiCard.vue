<script setup lang="ts">
import { NCard } from 'naive-ui'
import type { ChartData, ChartOptions } from 'chart.js'
import LineChart from '~/shared/ui/charts/LineChart.vue'
import { formatNumber } from '../lib/log-format'

const props = defineProps<{
  label: string
  color: string
  value: number
  series: number[]
  footer?: string
}>()

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.series.map((_, i) => String(i)),
  datasets: [
    {
      data: props.series,
      borderColor: props.color,
      backgroundColor: hexToRgba(props.color, 0.12),
      borderWidth: 1.5,
      fill: true,
      tension: 0.35,
      pointRadius: 0
    }
  ]
}))

// Спарклайн: без осей, сетки, легенды и тултипа.
const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { display: false, grid: { display: false } },
    y: { display: false, grid: { display: false } }
  },
  elements: { line: { borderJoinStyle: 'round' } }
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<template>
  <n-card size="small" class="kpi-card">
    <div class="kpi-card__head">
      <span class="kpi-card__dot" :style="{ backgroundColor: color }" />
      <span class="kpi-card__label">{{ label }}</span>
    </div>
    <div class="kpi-card__value">{{ formatNumber(value) }}</div>
    <div class="kpi-card__spark">
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
    <div v-if="footer" class="kpi-card__footer">{{ footer }}</div>
  </n-card>
</template>

<style scoped>
.kpi-card__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.kpi-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.kpi-card__label {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  color: #6b7280;
}

.kpi-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1f2a3a;
}

.kpi-card__spark {
  height: 40px;
  margin-top: 6px;
}

.kpi-card__footer {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #9aa4b2;
}
</style>
