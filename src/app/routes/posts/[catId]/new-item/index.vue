<script setup lang="ts">
import PostNewItemPage from '~/pages/posts/posts-new-item/ui/PostNewItemPage.vue'

definePageMeta({
  middleware: 'check-permission',
  ctx: 'content'
})
</script>

<template>
  <PostNewItemPage />
</template>

<style scoped></style>
