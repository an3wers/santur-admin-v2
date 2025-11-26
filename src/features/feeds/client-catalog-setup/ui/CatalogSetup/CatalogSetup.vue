<script setup lang="ts">
import { NCard, NSpace, NText, NButton, NCheckbox, NIcon, NSpin } from 'naive-ui'
import type { CategoryItem, SubjectItem } from '../../model/types'

defineProps<{
  subject?: SubjectItem
  loading?: boolean
}>()

const categories = defineModel<CategoryItem[]>('categories', { required: true })

// const emits = defineEmits<{
//   (e: 'onClose'): void
//   (e: 'onSave'): void
// }>()

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

function openBrandsSetting(childId: number) {}
</script>

<template>
  <n-space vertical>
    <div class="category" v-for="parent in categories" :key="parent.id">
      <div class="parent">
        <span class="parent__item">{{ parent.name }}</span>
        <n-button size="tiny" @click="toggleCheckedAllInCategory(parent.id)">{{
          parent.child?.every((c) => c.isChecked) ? 'Снять все' : 'Выбрать все'
        }}</n-button>
      </div>
      <div class="child" v-for="child in parent.child" :key="child.id">
        <div class="child__item">
          <n-checkbox v-model:checked="child.isChecked">{{ child.name }}</n-checkbox>
          <n-button size="tiny" @click="openBrandsSetting(child.id)">Настроить</n-button>
        </div>
      </div>
    </div>
  </n-space>
</template>

<style scoped>
.category {
  margin-bottom: 1rem;
}

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
  margin-top: 0.25rem;
}
</style>
