<script setup lang="ts">
import { NCard, NButton, NBadge } from 'naive-ui'

defineEmits<{
  (e: 'showComments'): void
}>()
</script>

<template>
  <n-card>
    <n-button block ghost type="primary" icon-placement="right" @click="$emit('showComments')">
      <template #icon>
        <n-badge value="0" show-zero type="info" />
      </template>
      Комментарии
    </n-button>
  </n-card>
</template>
