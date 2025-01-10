<script setup lang="ts">
import { NCard, NList, NIcon, NListItem, NText, NP } from 'naive-ui'
import type { TPvzsListItem } from '../model/pvzs.types'

const props = defineProps<{
  pvzs: TPvzsListItem[]
}>()
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
              <nuxt-link :to="`${$route.params.catId}/${item.id}`">
                <h4>{{ item.name }}</h4>
              </nuxt-link>
            </div>
            <div class="item-descr">
              <n-text>{{ item.address }}</n-text>
              <n-text>{{ item.phones }}</n-text>
              <n-text>{{ item.gpscoords }}</n-text>
            </div>
          </div>
          <div class="item-switch"></div>
          <div class="item-btn"></div>
        </div>
      </n-list-item>
    </n-list>
  </n-card>
</template>

<style scoped lang="css">
.item-row {
  display: flex;
  gap: 1.5rem;
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

.item-switch {
  flex-basis: 40px;
  flex-shrink: 0;
}
.item-btn {
  flex-basis: 40px;
  flex-shrink: 0;
}

.item-descr {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.item-descr > *:not(:first-child)::before {
  content: '•';
  margin-right: 0.5rem;
  color: var(--gray-400);
}
</style>
