<script setup lang="ts">
import { NCard, NList, NP, NPagination } from 'naive-ui'
import BannersListItem from './BannersListItem.vue'
import type { Banners } from '~/entities/banner'

const { banners, ownertId } = defineProps<{
  banners: Banners['items']
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
      <BannersListItem
        v-for="banner in banners"
        :key="banner.id"
        :banner="banner"
        :owner-id="ownertId"
        @on-update="$emit('onUpdate')"
      />
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
