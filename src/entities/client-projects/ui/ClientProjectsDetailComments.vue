<script setup lang="ts">
import { NCard, NButton, NBadge } from 'naive-ui'

defineProps<{
  commentsCount: number
}>()

defineEmits<{
  (e: 'showComments'): void
}>()
</script>

<template>
  <n-card>
    <n-button block ghost type="primary" icon-placement="right" @click="$emit('showComments')">
      <template #icon>
        <n-badge :value="commentsCount" show-zero type="info" />
      </template>
      Комментарии
    </n-button>
  </n-card>
</template>
