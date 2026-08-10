<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { registerCharts } from './register'

registerCharts()

const props = withDefaults(
  defineProps<{
    data: ChartData<'bar'>
    options?: ChartOptions<'bar'>
  }>(),
  {
    options: undefined
  }
)

const mergedOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } }
  },
  ...props.options
}))
</script>

<template>
  <div class="bar-chart">
    <Bar :data="data" :options="mergedOptions" />
  </div>
</template>

<style scoped>
.bar-chart {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
