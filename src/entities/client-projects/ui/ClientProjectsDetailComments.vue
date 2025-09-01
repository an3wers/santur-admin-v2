<script setup lang="ts">
import { NCard, NButton, NBadge } from 'naive-ui'
</script>

<template>
  <n-card>
    <n-button block ghost type="primary" icon-placement="right">
      <template #icon>
        <n-badge value="0" show-zero type="info" />
      </template>
      Комментарии
    </n-button>
  </n-card>
</template>
