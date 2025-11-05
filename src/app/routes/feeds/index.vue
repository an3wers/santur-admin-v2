<script setup lang="ts">
import { FeedsMainPage } from '~/pages/feeds/feeds-main'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'catalog-settings'
})
</script>

<template>
  <FeedsMainPage />
</template>
