<script setup lang="ts">
import { PvzsCategoryPage } from '~/pages/pvzs/pvzs-category'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <PvzsCategoryPage />
</template>

<style scoped></style>
