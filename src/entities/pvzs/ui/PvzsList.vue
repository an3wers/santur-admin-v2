<script setup lang="ts">
import { NCard, NList, NIcon, NListItem, NText, NTag, NDropdown, NButton } from 'naive-ui'
import type { PvzsListItem } from '../model/pvzs.types'
import { Dots } from '@vicons/tabler'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'

const { pvzs, ownertId } = defineProps<{
  pvzs: PvzsListItem[]
  ownertId: number
}>()

const moreMenu: DropdownMixedOption[] = [{ label: 'Изменить', key: 'edit' }]

function handleDropdown(key: string, itemId: number) {
  switch (key) {
    case 'edit':
      navigateTo(`${ownertId}/${itemId}`)
      break

    default:
      console.log('Dropdown', key)
  }
}
</script>

<template>
  <n-card>
    <n-list hoverable>
      <n-list-item v-for="item in pvzs" :key="item.id">
        <div class="item-row">
          <div class="item-id">
            <n-text depth="3">{{ item.id }}</n-text>
          </div>
          <div class="item-base">
            <div class="item-title">
              <nuxt-link :to="`${ownertId}/${item.id}`">
                <h4>{{ item.name }}</h4>
              </nuxt-link>
            </div>
            <div class="item-descr">
              <n-text depth="3">{{ item.city }}, {{ item.address }}</n-text>
              <n-text depth="3">{{ item.times }}</n-text>
              <n-text depth="3">{{ item.phones }}</n-text>
              <n-text depth="3">{{ item.gpscoords }}</n-text>
            </div>
          </div>
          <div class="item-status">
            <n-tag size="small" v-if="item.isActive" type="success">Опубликовано</n-tag>
            <n-tag size="small" v-else type="error">Не опубликовано</n-tag>
          </div>
          <div class="item-btn">
            <n-dropdown
              trigger="click"
              :options="moreMenu"
              @select="(key) => handleDropdown(key, item.id)"
            >
              <n-button quaternary circle size="small">
                <n-icon size="24px">
                  <Dots />
                </n-icon>
              </n-button>
            </n-dropdown>
          </div>
        </div>
      </n-list-item>
    </n-list>
  </n-card>
</template>

<style scoped lang="css">
.item-row {
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
}
.item-id {
  flex-basis: 60px;
  flex-shrink: 0;
}
.item-base {
  flex-grow: 1;
}

.item-title {
  display: inline-block;
}

.item-title h4 {
  margin-top: 0;
  margin-bottom: 0;
}

.item-title a {
  text-decoration: none;
  color: var(--gray-900);
}
.item-title a:hover {
  text-decoration: none;
  color: var(--primary-color-hover);
}

.item-status {
  flex-basis: 120px;
  flex-shrink: 0;
}
.item-btn {
  flex-basis: 40px;
  flex-shrink: 0;
  text-align: right;
}

.item-descr {
  display: flex;
  flex-direction: column;
}
</style>
