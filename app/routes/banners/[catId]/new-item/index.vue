<script setup lang="ts">
import { BannersNewItemPage } from '~/pages/banners/banners-new-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>
<template>
  <BannersNewItemPage />
</template>
