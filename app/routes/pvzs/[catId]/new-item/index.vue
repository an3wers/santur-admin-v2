<script setup lang="ts">
import { PvzsNewItemPage } from '~/pages/pvzs/pvzs-new-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <PvzsNewItemPage />
</template>

<style scoped></style>
