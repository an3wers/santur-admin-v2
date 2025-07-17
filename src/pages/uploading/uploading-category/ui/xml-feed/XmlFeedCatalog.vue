<script setup lang="ts">
import { NSpace, NCheckbox } from 'naive-ui'
import type { CatalogItem } from '../../model/types'

const categories = defineModel<CatalogItem[]>('state', { required: true })

defineEmits<{
  (e: 'onSelectAllInCategory', catId: number): void
}>()
</script>

<template>
  <n-space vertical>
    <div v-for="parent in categories" :key="parent.id">
      <div class="parent">
        <span class="parent__item">{{ parent.name }}</span>
        <!-- <n-button
          size="tiny"
          quaternary
          type="primary"
          @click="$emit('onSelectAllInCategory', parent.id)"
          >Выбрать все</n-button
        > -->
      </div>
      <div class="child" v-for="child in parent.child" :key="child.id">
        <n-checkbox v-model:checked="child.isChecked"
          ><span class="child__item">{{ child.name }}</span></n-checkbox
        >
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
}
</style>
