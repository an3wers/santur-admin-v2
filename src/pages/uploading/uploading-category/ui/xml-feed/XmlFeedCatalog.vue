<script setup lang="ts">
import { getCatalogQueryKey, groupCatalogItems, useCatalogApi } from '~/entities/catalog'
import { NSpace, NCard, NCheckbox, NButton } from 'naive-ui'
import { size } from 'zod/v4'

const { selectedCategoryIds } = defineProps<{
  platformKey: string
  selectedCategoryIds: number[]
}>()

// const selectedIds = ref(selectedCategoryIds)

const api = useCatalogApi()
const { data, status } = useAsyncData(`${getCatalogQueryKey()}-feed`, api.getCatalog, {
  transform: (data) => {
    const mapped = data.map((item) => ({
      id: item.id,
      name: item.name,
      parent_id: item.parent_id,
      vid: item.vid,
      isChecked: selectedCategoryIds.includes(item.id)
    }))

    return groupCatalogItems(mapped)
  },
  lazy: true
})

function toggleCategoryChecked(parentId: number) {
  if (!data.value) {
    return
  }

  data.value.forEach((parent) => {
    if (parent.id === parentId) {
      const hasChecked = parent.child.some((child) => child.isChecked)
      parent.child.forEach((child) => (child.isChecked = !hasChecked))
    }
  })
}

function setAllChecked(parentId: number) {
  if (!data.value) {
    return
  }

  data.value.forEach((parent) => {
    if (parent.id === parentId) {
      parent.child.forEach((child) => (child.isChecked = true))
    }
  })
}
</script>

<template>
  <n-card title="Каталог">
    <n-space vertical>
      <div v-for="parent in data" :key="parent.id">
        <div class="parent">
          <!-- <n-checkbox v-model:checked="parent.isChecked"
            ><span class="parent__item">{{ parent.name }}</span></n-checkbox
          > -->
          <span class="parent__item">{{ parent.name }}</span>
          <n-button size="tiny" quaternary type="primary" @click="setAllChecked(parent.id)"
            >Выбрать все</n-button
          >
        </div>
        <div class="child" v-for="child in parent.child" :key="child.id">
          <n-checkbox v-model:checked="child.isChecked"
            ><span class="child__item">{{ child.name }}</span></n-checkbox
          >
        </div>
      </div>
    </n-space>
  </n-card>
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
