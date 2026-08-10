<script setup lang="ts">
import { NCard, NList, NP, NPagination } from 'naive-ui'

import PostsListItem from './PostsListItem.vue'
import type { PostItemList } from '~/entities/post'

const { posts, ownertId } = defineProps<{
  posts: PostItemList[]
  ownertId: number
  ownerName: string
  page: number
  totalPages: number
  search: string
}>()

defineEmits<{
  (e: 'onChangePage', page: number): void
  (e: 'onUpdate'): void
}>()
</script>

<template>
  <n-card>
    <div class="search-container">
      <slot name="search" />
    </div>
    <n-list v-if="posts.length" hoverable>
      <PostsListItem
        v-for="item in posts"
        :key="item.id"
        :post="item"
        :ownert-id="ownertId"
        :owner-name="ownerName"
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
      <n-p :depth="3" style="text-align: center">Список пуст</n-p>
    </div>
  </n-card>
</template>

<style scoped>
.search-container {
  margin-bottom: 1rem;
  max-width: 320px;
}
.pagination-container {
  margin-top: 1rem;
}
</style>
