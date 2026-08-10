<script setup lang="ts">
import { TntksItemPage } from '~/pages/tntks/tntks-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <TntksItemPage />
</template>
