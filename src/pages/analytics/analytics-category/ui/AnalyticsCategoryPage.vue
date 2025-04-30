<script setup lang="ts">
import { NH1 } from 'naive-ui'
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
    <page-title>
      <template #title>
        <n-h1>{{ currentCatItem?.label }}</n-h1>
      </template>
    </page-title>
    <component :is="getComponent(currentCatItem?.label ?? '')" />
  </div>
</template>

<style scoped>
.wrap {
  padding: 1rem 1rem 3rem 1rem;
}
</style>
