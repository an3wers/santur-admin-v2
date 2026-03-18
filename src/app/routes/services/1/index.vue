<script setup lang="ts">
import EmailQueuePage from '~/pages/services/ui/EmailQueuePage.vue';

definePageMeta({
  middleware: 'check-permission',
  ctx: 'services'
})
</script>

<template>
  <EmailQueuePage />
</template>
