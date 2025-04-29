<script setup lang="ts">
import { PostItemCard, usePostItem } from '@/entities/post'
import { NSpace, NH1 } from 'naive-ui'
import { useCategoryApi } from '~/entities/category'

const route = useRoute()
const { catId } = route.params
const title = ref('Новая запись')

const { postItem, isModified } = usePostItem({ catId: Number(catId) })
const { getCategory } = useCategoryApi()
watch(
  () => postItem.categoryId,
  async (newCat) => {
    try {
      const category = await getCategory(newCat)
      postItem.extFields = category.extFields.map((item) => {
        return {
          id: 0,
          title: item.title,
          extFieldId: item.id,
          value: ''
        }
      })
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  },
  {
    immediate: true
  }
)
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
