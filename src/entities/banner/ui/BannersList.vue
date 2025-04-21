<script setup lang="ts">
import { NCard, NList } from 'naive-ui'
import type { BannersListItem } from '@/entities/banner'
import BannersListItemUi from './BannersListItem.vue'

const { banners, ownertId } = defineProps<{
  banners: BannersListItem[]
  ownertId: number
}>()

defineEmits<{
  (e: 'onUpdate'): void
}>()
</script>

<template>
  <n-card>
    <n-list hoverable>
      <BannersListItemUi
        v-for="banner in banners"
        :key="banner.id"
        :banner="banner"
        :ownert-id="ownertId"
        @on-update="$emit('onUpdate')"
      />
      <!-- TODO: Постраничная навигация -->
    </n-list>
  </n-card>
</template>
