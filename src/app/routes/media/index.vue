<script setup lang="ts">
import { MediaMainPage } from '~/pages/media'

definePageMeta({
  isRequaredAuth: true,
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <MediaMainPage />
</template>

<style scoped></style>
