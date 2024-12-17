<script setup lang="ts">
import { APP_SUB_NAME } from '~/shared/config/constants'
import { NText, NMenu, NSelect, useMessage, NDropdown, NButton, NIcon } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { useUserStore } from '~/entities/user'
import { Dots } from '@vicons/tabler'

const route = useRoute()
const message = useMessage()

// Nav
const navStore = useNavStore()
const selectedKey = ref(0)
const slug = route.name?.toString().split('-')[0]

if (slug) {
  selectedKey.value = navStore.mapNavigation?.[slug]?.id ?? 0
}

// Resources
async function changeResource(value: string) {
  navStore.setActiveResource(value)
  await navStore.loadMenu(value)
  navStore.saveActiveResourceToLS(value)
  navigateTo({ name: slug })
}

// User
const userStore = useUserStore()

const userMenu: DropdownMixedOption[] = [
  { label: 'Настройки', key: 'settings', disabled: true },
  { label: 'Выйти', key: 'exit' }
]

function handleUserDropdown(key: string) {
  switch (key) {
    case 'exit':
      logoutUser()
      break

    default:
      console.log('Dropdown', key)
      break
  }
}

async function logoutUser() {
  try {
    await userStore.logout()
    message.info('Вы вышли из профиля')
    await navigateTo({ path: '/profile/sign-in' })
  } catch (error) {
    console.error(error)
    message.error('Произошла ошибка при выходе из профиля')
  }
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
        <NMenu v-model:value="selectedKey" :options="navStore.getMenuOptions" :indent="20" />
      </div>
    </div>
    <div class="user-container">
      <div class="user__body">
        <div class="user__status">
          <NText depth="3"> Вы авторизованы</NText>
        </div>
        <div class="user__info">{{ userStore.user?.email }}</div>
      </div>
      <div class="user__dropdown">
        <n-dropdown trigger="click" :options="userMenu" @select="handleUserDropdown">
          <n-button quaternary circle size="small">
            <n-icon size="24px">
              <Dots />
            </n-icon>
          </n-button>
        </n-dropdown>
      </div>
    </div>
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
  width: 260px;
  min-width: 260px;
  top: 0px;
  position: sticky;
  border-right: 1px solid var(--gray-200);
}

.logo-container {
  margin: 0 0.75rem;
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

.resource-container,
.user-container {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--gray-200);
}

.resource__header {
  font-size: var(--font-size-sm);
  margin-bottom: 0.5rem;
}

.user-container {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.user__body {
  flex-grow: 1;
}

.user__status {
  font-size: var(--font-size-sm);
  margin-bottom: 0.25rem;
}

.user__info {
  font-size: var(--font-size-sm);
}
</style>
