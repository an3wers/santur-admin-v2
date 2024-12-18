<script setup lang="ts">
import UserPreview from '~/entities/user/ui/UserPreview.vue'
import { useNavStore } from '~/shared/navigation'
import AppSidebarFirst from '~/shared/ui/AppSidebar/AppSidebarFirst.vue'
import AppSidebarSecond from '~/shared/ui/AppSidebar/AppSidebarSecond.vue'

const navStore = useNavStore()

async function initLayout() {
  try {
    await navStore.loadResurces()
    navStore.checkAndSetActiveResource()
    await navStore.loadMenu(navStore.activeResource)
    navStore.saveActiveResourceToLS(navStore.activeResource)
  } catch (error) {
    throw createError({ fatal: false, statusMessage: 'Произошла ошибка при инициализации' })
  }
}

await initLayout()
</script>

<template>
  <div class="default-layout">
    <div class="wrapper">
      <AppSidebarFirst>
        <template #footer>
          <UserPreview />
        </template>
      </AppSidebarFirst>
      <AppSidebarSecond v-if="navStore.currentSubmenu.needSubmenu" />
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
</style>
