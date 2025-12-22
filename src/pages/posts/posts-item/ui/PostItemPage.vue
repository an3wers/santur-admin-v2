<script setup lang="ts">
import PostEditItem from '@/features/post/ui/PostEditItem.vue'
import { usePostEditItem } from '@/features/post'
import { NSpace, NH1 } from 'naive-ui'

const route = useRoute()
const { itemId, catId } = route.params
const title = ref('')

const { postItem, status, loadPostItem, isModified } = usePostEditItem({ catId: Number(catId) })

await loadPostItem(Number(itemId))

if (status.value === 'error') {
  throw createError({ statusMessage: 'Произошла ошибка на странице', statusCode: 400, fatal: true })
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
      <PostEditItem
        v-model:state="postItem"
        :is-modified="isModified"
        :owner-id="parseInt(catId as string)"
      />
    </n-space>
  </div>
</template>

<style scoped></style>
