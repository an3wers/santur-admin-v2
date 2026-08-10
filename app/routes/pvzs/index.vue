<script setup lang="ts">
import { PvzsMainPage } from '~/pages/pvzs/pvzs-main'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>
<template>
  <PvzsMainPage />
</template>

<style scoped></style>
