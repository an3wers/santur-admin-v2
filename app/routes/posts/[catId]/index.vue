<script setup lang="ts">
import { PostsCategoryPage } from '~/pages/posts/posts-category'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>
<template>
  <PostsCategoryPage />
</template>
