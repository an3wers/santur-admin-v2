<script setup lang="ts">
definePageMeta({
  middleware: [
    'check-permission',
    () => {
      return navigateTo('/analytics/1')
    }
  ],
  ctx: 'analytics'
})
</script>
<template>
  <div></div>
</template>
