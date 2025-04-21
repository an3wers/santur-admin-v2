<script setup lang="ts">
import { NCard } from 'naive-ui'
import type { BannersList } from '~/entities/banner'

defineProps<{
  banners: BannersList
  search: Ref<string>
}>()
</script>

<template>
  <div>
    <!-- <n-card>
      <div></div>

      <div></div>

      <div></div>
    </n-card> -->
  </div>
</template>

<style scoped></style>
