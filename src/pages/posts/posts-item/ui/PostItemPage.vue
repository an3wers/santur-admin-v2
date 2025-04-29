<script setup lang="ts">
import { PostItemCard, usePostItem } from '@/entities/post'
import { NSpace, NH1 } from 'naive-ui'

const route = useRoute()
const { itemId, catId } = route.params
const title = ref('')

const { postItem, status, loadPostItem, isModified } = usePostItem({ catId: Number(catId) })

await loadPostItem(Number(itemId))

if (status.value === 'error') {
  throw createError({ statusMessage: 'Произошла ошибка при загрузке брендов', statusCode: 400 })
}

if (status.value === 'success') {
  title.value = postItem?.title ?? ''
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Страницы" has-back :back-path="`/posts/${$route.params.catId}`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <PostItemCard
        v-model:state="postItem"
        :is-modified="isModified"
        :owner-id="parseInt(catId as string)"
      />
    </n-space>
  </div>
</template>

<style scoped></style>
