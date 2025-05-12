<script setup lang="ts">
import type { CatalogItem } from '../model/catalog-types'
import {
  NCollapse,
  NCollapseItem,
  NCard,
  NList,
  NListItem,
  NButton,
  NIcon,
  NText,
  NP
} from 'naive-ui'
import { Edit } from '@vicons/tabler'

defineProps<{
  items: CatalogItem[]
}>()
function moveEdit(itemId: number) {
  return navigateTo(`/tntks/${itemId}`)
}
</script>

<template>
  <n-card>
    <n-collapse :trigger-areas="['main', 'arrow']">
      <n-collapse-item v-for="item in items" :name="item.name" :key="item.id">
        <template #header
          ><div>
            <n-text tag="p">{{ item.name }}</n-text>
            <n-text tag="p" :depth="3" style="font-size: 12px"
              >Категорий: {{ item.child.length }}</n-text
            >
          </div></template
        >
        <template #header-extra>
          <n-button quaternary circle size="small" @click="moveEdit(item.id)">
            <n-icon size="24px">
              <Edit />
            </n-icon>
          </n-button>
        </template>
        <div class="child-container">
          <n-list hoverable>
            <n-list-item v-for="child in item.child" :key="child.id">
              <div class="row">
                <div class="row-name">{{ child.name }}</div>
                <div class="row-button">
                  <n-button quaternary circle size="small" @click="moveEdit(child.id)">
                    <n-icon size="24px">
                      <Edit />
                    </n-icon>
                  </n-button>
                </div>
              </div>
            </n-list-item>
          </n-list>
        </div>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>

<style scoped>
.child-container {
  margin-left: 2rem;
}
.row {
  display: flex;
  gap: 1rem;
}

.row-name {
  flex-grow: 1;
}

.row-name {
  flex-shrink: 0;
}
</style>
