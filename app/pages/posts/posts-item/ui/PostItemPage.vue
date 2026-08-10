<script setup lang="ts">
import PostEditItem from '@/features/post/ui/PostEditItem.vue'
import { NSpace, NH1 } from 'naive-ui'
import { usePostApi } from '~/entities/post'

const route = useRoute()
const { itemId, catId } = route.params
const title = ref('')

const { getPost } = usePostApi()

const {
  data: postItem,
  status,
  error
} = await useAsyncData(`post-item-${String(itemId)}`, () => getPost(Number(itemId as string)), {
  lazy: false
})

if (status.value === 'error') {
  throw createError({
    statusCode: 400,
    fatal: true,
    statusMessage: error.value?.message || 'Произошла ошибка на странице'
  })
}

if (status.value === 'success' && postItem.value) {
  title.value = postItem.value.title
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
      <PostEditItem :post-item="postItem ?? undefined" :owner-id="Number(catId as string)" />
    </n-space>
  </div>
</template>

<style scoped></style>
