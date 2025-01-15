<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import { PvzsItemCard, usePvzsItemStore, usePvzsApi, usePvzsItem } from '~/entities/pvzs'

const title = ref('')
const route = useRoute()

const { itemId } = route.params

const pvzsItemStore = usePvzsItemStore()

pvzsItemStore.$reset()

const { data, status } = await usePvzsItem(itemId as string)

if (data.value && status.value === 'success') {
  pvzsItemStore.setPvzsItem(data.value)
  pvzsItemStore.setPvzsItemSecondaryFileds(data.value)
  title.value = data.value.name
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title
        back-label="Все пункты выдачи"
        has-back
        :back-path="`/pvzs/${route.params.catId}`"
      >
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <PvzsItemCard v-if="status === 'success' || data" />
    </n-space>
  </div>
</template>

<style scoped></style>
