<script setup lang="ts">
import { NCard, NList, NP, NPagination } from 'naive-ui'
import type { BannersListItem } from '@/entities/banner'
import BannersListItemUi from './BannersListItem.vue'

const { banners, ownertId } = defineProps<{
  banners: BannersListItem[]
  ownertId: number
  page: number
  totalPages: number
}>()

defineEmits<{
  (e: 'onChangePage', page: number): void
  (e: 'onUpdate'): void
}>()
</script>

<template>
  <n-card>
    <n-list v-if="banners.length" hoverable>
      <BannersListItemUi
        v-for="banner in banners"
        :key="banner.id"
        :banner="banner"
        :ownert-id="ownertId"
        @on-update="$emit('onUpdate')"
      />
      <!-- TODO: Постраничная навигация -->
      <div class="pagination-container">
        <NPagination
          :page="page"
          @update-page="(val) => $emit('onChangePage', val)"
          :page-count="totalPages"
        />
      </div>
    </n-list>
    <div v-else>
      <n-p :depth="3" style="text-align: center">Список баннеров пуст</n-p>
    </div>
  </n-card>
</template>

<style scoped>
.pagination-container {
  margin-top: 1rem;
}
</style>
