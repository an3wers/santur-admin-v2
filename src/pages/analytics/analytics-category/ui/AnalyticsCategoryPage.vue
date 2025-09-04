<script setup lang="ts">
import { NH1, NSpin } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import AnaliticsOrders from './AnaliticsOrders.vue'
import AnaliticsClients from './AnaliticsClients.vue'

const route = useRoute()
const { catId } = route.params

const navStore = useNavStore()

const currentCatItem = computed(() => {
  return navStore.currentNavigationMenu?.items.find((item) => item.id === parseInt(catId as string))
})

function getComponent(key: string) {
  switch (key) {
    case 'Заказы':
      return AnaliticsOrders
    case 'Клиенты':
      return AnaliticsClients
    default:
      return NH1
  }
}
</script>

<template>
  <div class="wrap">
    <page-title back-label="Главная" has-back :back-path="`/`">
      <template #title>
        <n-h1>{{ currentCatItem?.label }}</n-h1>
      </template>
    </page-title>
    <Suspense>
      <template #fallback>
        <n-spin>
          <div style="height: 100px"></div>
        </n-spin>
      </template>
      <component :is="getComponent(currentCatItem?.label ?? '')" />
    </Suspense>
  </div>
</template>

<style scoped>
.wrap {
  padding: 1rem 1rem 3rem 1rem;
}
</style>
