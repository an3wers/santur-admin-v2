<script setup lang="ts">
import { NSpace, NCheckbox, NButton, NSpin } from 'naive-ui'
import type { AsyncDataRequestStatus } from '#app'
import type { FeedCategoryItem } from '../model/types'
defineProps<{
  status: AsyncDataRequestStatus
}>()

const categories = defineModel<FeedCategoryItem[]>('state', { required: true })

function toggleCheckedAllInCategory(catId: number) {
  categories.value?.forEach((item) => {
    if (item.id === catId) {
      const isCheckedAll = item.child?.every((c) => c.isChecked)

      if (isCheckedAll) {
        item.child?.forEach((c) => {
          c.isChecked = false
        })
      } else {
        item.child?.forEach((c) => {
          c.isChecked = true
        })
      }
    }
  })
}
</script>

<template>
  <n-space vertical>
    <n-spin :show="status === 'pending'" size="small">
      <div v-for="parent in categories" :key="parent.id">
        <div class="parent">
          <span class="parent__item">{{ parent.name }}</span>
          <n-button
            size="tiny"
            secondary
            type="primary"
            @click="toggleCheckedAllInCategory(parent.id)"
            >{{ parent.child?.every((c) => c.isChecked) ? 'Снять все' : 'Выбрать все' }}</n-button
          >
        </div>
        <div class="child" v-for="child in parent.child" :key="child.id">
          <div class="child__item">
            <n-checkbox v-model:checked="child.isChecked">{{ child.name }}</n-checkbox>
          </div>
        </div>
      </div>
    </n-spin>
  </n-space>
</template>

<style scoped>
.parent {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.parent__item {
  font-weight: 700;
}

.child {
  margin-left: 1rem;
}

.child__item {
  font-weight: 400;
  margin-top: 0.25rem;
}
</style>
