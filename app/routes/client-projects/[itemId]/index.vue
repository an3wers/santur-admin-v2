<script setup lang="ts">
import { ClientProjectsItemPage } from '@/pages/client-projects/client-projects-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'client-projects'
})
</script>

<template>
  <ClientProjectsItemPage />
</template>
