<script setup lang="ts">
import type { DomainErrorRow } from '~/entities/services'
import { formatNumber } from '../lib/log-format'

const props = defineProps<{
  rows: DomainErrorRow[]
}>()

// Палитра баров (совпадает по духу с референсом).
const PALETTE = ['#f0a020', '#8a63d2', '#64748b', '#2080f0', '#18a058', '#d03050', '#94a3b8']

const max = computed(() => props.rows.reduce((m, r) => Math.max(m, r.count), 0) || 1)

function color(index: number): string {
  return PALETTE[index % PALETTE.length]
}

function width(count: number): string {
  return `${Math.max((count / max.value) * 100, 2)}%`
}
</script>

<template>
  <div class="domain-bars">
    <div v-for="(row, i) in rows" :key="row.domain" class="domain-bars__row">
      <div class="domain-bars__top">
        <span class="domain-bars__name">{{ row.domain }}</span>
        <span class="domain-bars__count">{{ formatNumber(row.count) }}</span>
      </div>
      <div class="domain-bars__track">
        <div
          class="domain-bars__fill"
          :style="{ width: width(row.count), backgroundColor: color(i) }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.domain-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.domain-bars__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.domain-bars__name {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  color: #1f2a3a;
}

.domain-bars__count {
  font-size: 0.8125rem;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

.domain-bars__track {
  height: 6px;
  border-radius: 3px;
  background-color: #f1f5f9;
  overflow: hidden;
}

.domain-bars__fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
</style>
