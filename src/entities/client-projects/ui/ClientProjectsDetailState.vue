<script setup lang="ts">
import { NCard } from 'naive-ui'

defineSlots<{
  action(): any
}>()
</script>

<template>
  <n-card>
    <slot name="action" />
  </n-card>
</template>
