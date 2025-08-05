<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import { NButton } from 'naive-ui'

defineProps<{
  lettersEng: { letter: string }[]
  lettersRus: { letter: string }[]
  status: AsyncDataRequestStatus
  currentLetter: string
}>()

defineEmits<{
  (e: 'onLetterClick', letter: string): void
}>()
</script>

<template>
  <div v-if="lettersEng.length || lettersRus.length" class="letters-container">
    <div class="letters-row">
      <n-button
        v-for="item in lettersEng"
        size="small"
        :disabled="status === 'pending'"
        :type="currentLetter === item.letter ? 'primary' : 'default'"
        :key="item.letter"
        @click="$emit('onLetterClick', item.letter)"
        >{{ item.letter }}</n-button
      >
    </div>
    <div class="letters-row">
      <n-button
        v-for="item in lettersRus"
        size="small"
        :disabled="status === 'pending'"
        :type="currentLetter === item.letter ? 'primary' : 'default'"
        :key="item.letter"
        @click="$emit('onLetterClick', item.letter)"
        >{{ item.letter }}</n-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
.letters-container {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.letters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
