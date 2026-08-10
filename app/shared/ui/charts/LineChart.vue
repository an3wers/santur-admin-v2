<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { registerCharts } from './register'

registerCharts()

const props = withDefaults(
  defineProps<{
    data: ChartData<'line'>
    options?: ChartOptions<'line'>
  }>(),
  {
    options: undefined
  }
)

const mergedOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom' }
  },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } }
  },
  ...props.options
}))
</script>

<template>
  <div class="line-chart">
    <Line :data="data" :options="mergedOptions" />
  </div>
</template>

<style scoped>
.line-chart {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
