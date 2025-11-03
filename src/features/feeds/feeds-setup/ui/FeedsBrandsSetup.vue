<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import { NCheckbox, NSpin } from 'naive-ui'
import type { FeedBrands } from '../model/types'
import { BrandLatters } from '~/entities/brand'

const { brands, status, currentLetter } = defineProps<{
  brands: FeedBrands | null
  status: AsyncDataRequestStatus
  currentLetter: string
}>()

defineEmits<{
  (e: 'onToggleBrand', brand: string): void
  (e: 'onSetLetter', letter: string): void
}>()

const lettersRus = computed(() => {
  return brands?.letters.filter((l) => l.lng === 'rus') || []
})

const lettersEng = computed(() => {
  return brands?.letters.filter((l) => l.lng === 'eng') || []
})
</script>

<template>
  <div>
    <BrandLatters
      v-if="lettersEng.length || lettersRus.length"
      :letters-eng="lettersEng"
      :letters-rus="lettersRus"
      :status="status"
      :current-letter="currentLetter"
      @on-letter-click="$emit('onSetLetter', $event)"
    />
    <n-spin :show="status === 'pending'" size="small">
      <div class="brands">
        <div v-for="item in brands?.brends" :key="item.id" class="brands__item">
          <n-checkbox
            v-model:checked="item.isChecked"
            @update:checked="$emit('onToggleBrand', item.name)"
            >{{ item.name }}</n-checkbox
          >
        </div>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.brands {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  min-height: 100px;
}

.brands__item {
  margin-top: 0.25rem;
}
</style>
