<script setup lang="ts">
import { NH1, NSpace, NGrid, NGi, NCard, useMessage } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import SubnavList from './SubnavList.vue'
import { useUserStore } from '~/entities/user'

const navStore = useNavStore()
const userStore = useUserStore()

const navItems = computed(() => {
  if (!navStore.navigationWithZeroLavel) {
    return []
  }
  return navStore.applyPermissionsFilter(navStore.navigationWithZeroLavel, userStore.roles)
})

const route = useRoute()
const message = useMessage()
watchEffect(() => {
  if (route.query?.error === 'checkRole') {
    message.error('У вас недостаточно прав доступа')
    return navigateTo({ query: undefined })
  }
})
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <n-h1>Управление сервисами</n-h1>
      <n-grid x-gap="12" y-gap="12" cols="s:2 m:3 l:4" responsive="screen">
        <n-gi v-for="item in navItems" :key="item.id">
          <n-card class="n-card-item" size="small">
            <template #header>
              {{ item.label }}
            </template>

            <SubnavList :nav-items="item.items" :parent-model-name="item.modelName" />
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </div>
</template>

<style scoped>
.n-card-item {
  position: relative;
  height: 100%;
}

/*.n-card-header a {
  display: block;
  color: var(--gray-900);
  text-decoration: none;
}*/
</style>
