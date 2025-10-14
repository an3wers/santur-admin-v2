<script setup lang="ts">
import { NButton, NSpace, NText, NAlert } from 'naive-ui'

const { totalBonus = 1500, requestBonus = 1000 } = defineProps<{
  totalBonus?: number
  requestBonus?: number
}>()

const emits = defineEmits<{
  (e: 'onRequestBonus'): void
  (e: 'onApproveRequest'): void
  (e: 'onCancelRequest'): void
}>()

onMounted(() => {
  emits('onRequestBonus')
})
</script>

<template>
  <n-space vertical size="large">
    <div>
      <n-text tag="p" depth="3">Общее количество баллов</n-text>
      <n-text tag="p" strong style="font-size: 1.25rem">{{ totalBonus }}</n-text>
    </div>
    <n-alert type="info" :bordered="true">
      <n-text tag="p" strong>Запрос на списание баллов</n-text>
      <n-text tag="p" strong style="font-size: 1.25rem">{{ requestBonus }}</n-text>
      <n-space justify="end" style="margin-top: 1rem">
        <n-button type="error" size="small" @click="emits('onCancelRequest')">Отменить</n-button>
        <n-button type="primary" size="small" @click="emits('onApproveRequest')"
          >Подтвердить</n-button
        >
      </n-space>
    </n-alert>
  </n-space>
</template>
