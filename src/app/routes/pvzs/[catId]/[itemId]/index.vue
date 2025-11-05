<script setup lang="ts">
import { PvzsItemPage } from '~/pages/pvzs/pvzs-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <PvzsItemPage />
</template>

<style scoped></style>
