<script setup lang="ts">
import { PostItemPage } from '~/pages/posts/posts-item'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <PostItemPage />
</template>
