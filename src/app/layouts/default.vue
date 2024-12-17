<script setup lang="ts">
import UserPreview from '~/entities/user/ui/UserPreview.vue'
import { useNavStore } from '~/shared/navigation'
import AppSidebar from '~/shared/ui/AppSidebar/AppSidebar.vue'

const navStore = useNavStore()
const route = useRoute()

const firstLevelName = computed(() => {
  return route.name?.toString().split('-')[0]
})

// Вынести в компонент AppSidebarSub
const getSubmenu = computed(() => {
  return navStore.getSubMenuBySlug(firstLevelName.value ?? '')
})

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
      <AppSidebar :first-level-name="firstLevelName">
        <template #footer>
          <UserPreview />
        </template>
      </AppSidebar>
      <AppSidebarSub
        v-if="getSubmenu"
        :title="getSubmenu.label"
        :firstLevelMenuName="firstLevelName ?? ''"
        :categories="getSubmenu.items"
      />
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
