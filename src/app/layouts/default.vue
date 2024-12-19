<script setup lang="ts">
import AddEditCategory from '~/entities/category/ui/AddEditCategory.vue'
import UserPreview from '~/entities/user/ui/UserPreview.vue'
import { NavbarFirst, NavbarSecond, useNavStore } from '~/shared/navigation'

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
      <NavbarFirst>
        <template #footer>
          <UserPreview />
        </template>
      </NavbarFirst>
      <NavbarSecond v-if="navStore.currentSubmenu.needSubmenu">
        <template #modal="{ firstLevelMenuName, onCancelModal, onUpdateMenu }">
          <AddEditCategory
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
</style>
