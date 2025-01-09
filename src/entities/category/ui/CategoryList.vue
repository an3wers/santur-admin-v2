<script setup lang="ts">
import { NCard, NList, NIcon, NListItem, NText } from 'naive-ui'
import type { MenuItem } from '~/shared/navigation/model/nav.types'
import { ArrowNarrowRight } from '@vicons/tabler'

interface Props {
  items: MenuItem[]
}

const props = defineProps<Props>()
</script>

<template>
  <n-card>
    <n-list hoverable>
      <n-list-item v-for="item in items" :key="item.id">
        <div class="item-row">
          <div class="item-id">
            <n-text depth="3">{{ item.id }}</n-text>
          </div>
          <div class="item-name">
            <nuxt-link :to="`/${item.modelName}/${item.id}`">
              <h4>{{ item.label }}</h4>
            </nuxt-link>
          </div>
          <div class="item-icon">
            <n-icon size="24px">
              <ArrowNarrowRight />
            </n-icon>
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
}

.item-id {
  flex-basis: 60px;
  flex-shrink: 0;
}

.item-icon {
  margin-left: auto;
}

.item-name h4 {
  margin-top: 0;
  margin-bottom: 0;
}

.item-name a {
  text-decoration: none;
  color: var(--gray-900);
}

.item-name a:hover {
  text-decoration: none;
  color: var(--primary-color-hover);
}
</style>
