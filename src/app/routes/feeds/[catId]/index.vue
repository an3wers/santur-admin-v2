<script setup lang="ts">
import { FeedsCategoryPage } from '~/pages/feeds/feeds-category'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'catalog-settings'
})
</script>
<template>
  <FeedsCategoryPage />
</template>
