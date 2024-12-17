<script setup lang="ts">
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { Dots } from '@vicons/tabler'
import { useUserStore } from '../model/user.store'
import { NText, NDropdown, NButton, NIcon, useMessage } from 'naive-ui'

const userStore = useUserStore()
const message = useMessage()

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
</template>

<style scoped>
.user-container {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--gray-200);
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
