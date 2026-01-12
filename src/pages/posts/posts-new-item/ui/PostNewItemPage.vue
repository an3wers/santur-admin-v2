<script setup lang="ts">
import PostEditItem from '@/features/post/ui/PostEditItem.vue'
import { NSpace, NH1 } from 'naive-ui'

const route = useRoute()
const { catId } = route.params
const title = ref('Новая запись')
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Страницы" has-back :back-path="`/posts/${$route.params.catId}`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <PostEditItem :owner-id="parseInt(catId as string)" />
    </n-space>
  </div>
</template>

<style scoped></style>
