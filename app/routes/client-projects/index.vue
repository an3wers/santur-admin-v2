<script setup lang="ts">
import { ClientProjectsMainPage } from '@/pages/client-projects/client-projects-main'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'client-projects'
})
</script>

<template>
  <ClientProjectsMainPage />
</template>
