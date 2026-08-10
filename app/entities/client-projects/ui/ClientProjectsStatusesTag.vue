<script setup lang="ts">
import { NTag } from 'naive-ui'
import { getStatusColor } from '../lib/get-status-color'

const { statusKey, statusLabel } = defineProps<{
  statusKey: string
  statusLabel: string
}>()

const params = computed(() => {
  const curr = getStatusColor(statusKey)

  return {
    color: {
      color: curr.light,
      textColor: curr.text,
      borderColor: 'transparent'
    }
  }
})
</script>
<template>
  <n-tag v-bind="params" size="small"> {{ statusLabel }} </n-tag>
</template>

<style scoped></style>
