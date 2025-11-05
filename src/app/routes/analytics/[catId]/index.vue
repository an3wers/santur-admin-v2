<script setup lang="ts">
import { AnalyticsCategoryPage } from '~/pages/analytics/analytics-category'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'analytics'
})
</script>

<template>
  <AnalyticsCategoryPage />
</template>

<style scoped></style>
