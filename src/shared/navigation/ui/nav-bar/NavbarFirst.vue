<script setup lang="ts">
import { APP_SUB_NAME } from '~/shared/config/constants'
import { NText, NMenu, NSelect } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()

const selectedKey = ref(0)

const computedSelectedKey = computed({
  get: () => navStore.mapNavigation?.[navStore.firstLevelName]?.id ?? 0,
  set: (value) => {
    selectedKey.value = value
  }
})

async function changeResource(value: string) {
  navStore.setActiveResource(value)
  await navStore.loadMenu(value)
  navStore.saveActiveResourceToLS(value)
  navigateTo({ name: navStore.firstLevelName })
}
</script>
<template>
  <div class="sidebar">
    <div class="logo-container">
      <div class="logo-img">
        <NuxtLink href="/">
          <img src="/logo/logo.svg" alt="logo" />
        </NuxtLink>
      </div>
      <n-text depth="3" class="logo-descr">{{ APP_SUB_NAME }}</n-text>
    </div>
    <div class="resource-container">
      <div class="resource__header">
        <NText depth="3"> Ресурс </NText>
      </div>
      <div class="resource__name">
        <n-select
          @update-value="changeResource"
          size="small"
          :value="navStore.activeResource"
          :options="navStore.resourcesSelectore"
        />
      </div>
    </div>
    <div class="nav-container">
      <div class="nav-container__title">
        <NText depth="3">Разделы</NText>
      </div>
      <div class="nav-container__menu">
        <NMenu
          v-model:value="computedSelectedKey"
          :options="navStore.getMenuOptions"
          :indent="20"
        />
      </div>
    </div>
    <slot name="footer" />
  </div>
</template>

<style scoped>
.sidebar {
  background-color: var(--white);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100dvh;
  padding: 1rem 0.5rem 1.25rem 0.5rem;
  width: 240px;
  min-width: 240px;
  top: 0px;
  position: sticky;
  border-right: 1px solid var(--gray-200);
}

.logo-container {
  margin: 0 0.5rem;
}

.logo-descr {
  font-size: var(--font-size-sm);
}

.nav-container {
  flex-grow: 1;
  min-height: 200px;
  overflow-y: auto;
}

.nav-container__title {
  font-size: var(--font-size-sm);
  margin-inline: 0.75rem;
}

.resource-container {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--gray-200);
}

.resource__header {
  font-size: var(--font-size-sm);
  margin-bottom: 0.5rem;
}
</style>
