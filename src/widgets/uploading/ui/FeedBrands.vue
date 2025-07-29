<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import type { BrandsData } from '../model/types'
import { NCheckbox, NSpin } from 'naive-ui'

defineProps<{
  data: BrandsData['brends']
  status: AsyncDataRequestStatus
}>()

defineEmits<{
  (e: 'onUpdate', brand: string): void
}>()
</script>

<template>
  <div>
    <slot name="letters" />
    <n-spin :show="status === 'pending'" size="small">
      <div class="brands">
        <div v-for="item in data" :key="item.id" class="brands__item">
          <n-checkbox
            v-model:checked="item.isChecked"
            @update:checked="$emit('onUpdate', item.name)"
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
}

.brands__item {
  margin-top: 0.25rem;
}
</style>
