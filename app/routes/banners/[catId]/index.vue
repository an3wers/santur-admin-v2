<script setup lang="ts">
import { BannersCategoryPage } from '~/pages/banners/banners-category'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>
<template>
  <BannersCategoryPage />
</template>

<style scoped></style>
