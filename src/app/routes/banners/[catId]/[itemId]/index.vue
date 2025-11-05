<script setup lang="ts">
import { BannersItemPage } from '~/pages/banners/banners-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <BannersItemPage />
</template>
