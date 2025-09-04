<script setup lang="ts">
import type { MenuItem } from '~/shared/navigation/model/nav-types'
import { NButton, NIcon, NText } from 'naive-ui'
import { ChevronUp, ChevronDown } from '@vicons/tabler'

const { navItems, parentModelName } = defineProps<{
  navItems: MenuItem[]
  parentModelName: string
}>()

const LIMIT = 3
const expanded = ref(false)

const items = computed(() => {
  return expanded.value ? navItems : navItems.filter((_, index) => index < LIMIT)
})

const itemsWithPath = computed(() => {
  if (parentModelName == 'analytics' || parentModelName == 'uploading') {
    return items.value.map((item) => {
      return {
        ...item,
        path: `/${item.modelName}/${item.id}`
      }
    })
  } else {
    return items.value.map((item) => {
      return {
        ...item,
        path: `/${item.modelName}`
      }
    })
  }
})
</script>

<template>
  <div class="subnav">
    <div v-if="navItems.length == 0">
      <n-text :depth="3"> В разработке </n-text>
    </div>

    <template v-else>
      <div class="subnav-list">
        <nuxt-link v-for="item in itemsWithPath" :key="item.id" :to="item.path">
          {{ item.label }}
        </nuxt-link>
      </div>
      <div v-if="navItems.length > LIMIT" class="subnav-btn">
        <n-button
          tertiary
          type="primary"
          size="tiny"
          icon-placement="right"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Свернуть' : 'Показать все' }}
          <n-icon :component="expanded ? ChevronUp : ChevronDown" />
        </n-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.subnav-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}
.subnav-btn {
  margin-top: 0.5rem;
  text-align: center;
}
</style>
