<script setup lang="ts">
import { BrandsMainPage } from '~/pages/brands/brands-main'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <BrandsMainPage />
</template>
