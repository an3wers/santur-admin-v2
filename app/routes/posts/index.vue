<script setup lang="ts">
import { PostsMainPage } from '~/pages/posts/posts-main'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>
<template>
  <PostsMainPage />
</template>
