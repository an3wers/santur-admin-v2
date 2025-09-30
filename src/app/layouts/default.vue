<script setup lang="ts">
import { CategoryDetail } from '~/entities/category'
import UserPreview from '~/entities/user/ui/UserPreview.vue'
import { NavbarFirst, NavbarSecond, useNavStore } from '~/shared/navigation'
import { APP_SUB_NAME } from '~/shared/config/constants'
import { NSelect, NText } from 'naive-ui'

const navStore = useNavStore()

async function initLayout() {
  try {
    await navStore.loadResurces()
    navStore.checkAndSetActiveResource()
    await navStore.loadMenu(navStore.activeResource)
    navStore.saveActiveResourceToLS(navStore.activeResource)
  } catch (error) {
    console.error(error)
    throw createError({ fatal: false, statusMessage: 'Произошла ошибка при инициализации' })
  }
}

await initLayout()

async function changeResource(value: string) {
  try {
    navStore.setActiveResource(value)
    await navStore.loadMenu(value)
    navStore.saveActiveResourceToLS(value)
    navigateTo({ name: navStore.firstLevelName })
  } catch (error) {
    console.error(error)
    throw createError({ fatal: false, statusMessage: 'Произошла ошибка при инициализации' })
  }
}
</script>

<template>
  <div class="default-layout">
    <div class="wrapper">
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
        <NavbarFirst />
        <UserPreview />
      </div>

      <!-- <NavbarFirst>
        <template #footer>
          <UserPreview />
        </template>
      </NavbarFirst> -->
      <NavbarSecond v-if="navStore.currentSubmenu.needSubmenu">
        <template #modal="{ firstLevelMenuName, onCancelModal, onUpdateMenu }">
          <CategoryDetail
            :first-level-name="firstLevelMenuName"
            @on-update="onUpdateMenu"
            @on-cancel="onCancelModal"
          />
        </template>
      </NavbarSecond>
      <main class="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: row;
  align-items: start;
}

.main {
  flex-grow: 1;
}

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
