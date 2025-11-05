<script setup lang="ts">
import { TntksMainPage } from '~/pages/tntks/tntks-main'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>
<template>
  <TntksMainPage />
</template>
