<script setup lang="ts">
import { BannersMainPage } from '~/pages/banners/banners-main'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <BannersMainPage />
</template>

<style scoped></style>
