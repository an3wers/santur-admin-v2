<script setup lang="ts">
import { NH2, NH3, NGrid, NGi, NCard, NIcon } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import { ArrowNarrowRight } from '@vicons/tabler'

const navStore = useNavStore()
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <n-h2>Управление сервисами</n-h2>
      <!-- Плашки с пунктами меню -->
      <n-grid x-gap="12" y-gap="12" cols="s:1 m:2 l:3" responsive="screen">
        <n-gi v-for="item in navStore.navigation" :key="item.id">
          <n-card size="huge">
            <template #header>
              <NuxtLink :to="`/${item.modelName}`">
                <!-- <n-h3> -->
                {{ item.label }}
                <!-- </n-h3> -->
              </NuxtLink></template
            >
            <template #header-extra>
              <n-icon size="24px" color="#94a3b8"> <ArrowNarrowRight /> </n-icon
            ></template>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </div>
</template>

<style scoped>
.n-card-header a {
  display: block;
  color: var(--gray-900);
  text-decoration: none;
}
</style>
