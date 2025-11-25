<script setup lang="ts">
import ClientCatalogPage from '~/pages/feeds/client-catalog/ui/ClientCatalogPage.vue'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'catalog-settings'
})
</script>

<template>
  <ClientCatalogPage />
</template>
