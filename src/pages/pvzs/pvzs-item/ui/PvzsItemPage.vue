<script setup lang="ts">
import { NSpace, NH1, useMessage } from 'naive-ui'
import { usePvzsEditItemStore } from '@/features/pvzs'
import PvzsEditItem from '~/features/pvzs/ui/PvzsEditItem.vue'

const route = useRoute()

const { itemId } = route.params

const pvzsItemStore = usePvzsEditItemStore()

pvzsItemStore.$reset()

await pvzsItemStore.loadPvzsItem(itemId as string)

const message = useMessage()

const title = computed(() => {
  return pvzsItemStore.pvzsItem.name ?? ''
})

watchEffect(() => {
  if (pvzsItemStore.loadStatus === 'error') {
    console.error(pvzsItemStore.loadError)
    message.error(pvzsItemStore.loadError || 'На странице произошла ошибка')
  }
})
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Пункты выдачи" has-back :back-path="`/pvzs/${route.params.catId}`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <PvzsEditItem v-if="pvzsItemStore.loadStatus === 'success'" />
    </n-space>
  </div>
</template>

<style scoped></style>
