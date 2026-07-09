<script setup lang="ts">
import LogMonitorPage from '~/pages/services/ui/LogMonitorPage.vue'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'services'
})
</script>

<template>
  <LogMonitorPage />
</template>
