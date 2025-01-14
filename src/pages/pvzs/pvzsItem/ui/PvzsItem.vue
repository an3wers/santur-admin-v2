<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import { PvzsItemCard, usePvzsItemStore } from '~/entities/pvzs'

const title = ref('')
const route = useRoute()

const { itemId } = route.params

const pvzsItemStore = usePvzsItemStore()

pvzsItemStore.$reset()

await pvzsItemStore.getPvzsItem(itemId as string)

if (pvzsItemStore.pvzsItemStatus === 'error') {
  // TODO: Обработать сценарий с ошибкой
}

if (pvzsItemStore.pvzsItemStatus === 'success') {
  title.value = pvzsItemStore.pvzsItem.name
}

onMounted(() => {
  console.log('Route', route.params)
})
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title>
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <PvzsItemCard v-if="pvzsItemStore.pvzsItemStatus === 'success'" />
    </n-space>
  </div>
</template>

<style scoped></style>
