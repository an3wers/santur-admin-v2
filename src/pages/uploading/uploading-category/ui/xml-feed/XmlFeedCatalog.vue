<script setup lang="ts">
import { NSpace, NCheckbox, NButton } from 'naive-ui'
import type { CatalogItem } from '../../model/types'

const categories = defineModel<CatalogItem[]>('state', { required: true })

defineEmits<{
  (e: 'onToggleCheckAllInCategory', catId: number): void
}>()
</script>

<template>
  <n-space vertical>
    <div v-for="parent in categories" :key="parent.id">
      <div class="parent">
        <span class="parent__item">{{ parent.name }}</span>
        <n-button
          size="tiny"
          secondary
          type="primary"
          @click="$emit('onToggleCheckAllInCategory', parent.id)"
          >{{ parent.child?.every((c) => c.isChecked) ? 'Снять все' : 'Выбрать все' }}</n-button
        >
      </div>
      <div class="child" v-for="child in parent.child" :key="child.id">
        <div class="child__item">
          <n-checkbox v-model:checked="child.isChecked">{{ child.name }}</n-checkbox>
        </div>
      </div>
    </div>
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
