<script setup lang="ts">
import { BrandItemPage } from '@/pages/brands/brands-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>
<template>
  <BrandItemPage />
</template>
