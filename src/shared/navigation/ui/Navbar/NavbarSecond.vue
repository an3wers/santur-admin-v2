<script setup lang="ts">
import { type MenuOption, NModal, NButton, NMenu } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()

const modalTitle = 'Добавить категорию'

const selectedKey = ref(-1)
selectedKey.value = navStore.secondLevelId

const showModal = ref(false)

function toogleModal() {
  showModal.value = !showModal.value
}

async function updateMenu() {
  await navStore.loadMenu(navStore.activeResource)
}

// TODO: Рефакторинг
const hasActionBtn = computed(() => {
  return (
    navStore.firstLevelName === 'posts' ||
    navStore.firstLevelName === 'banners' ||
    navStore.firstLevelName === 'pvzs'
  )
})
</script>
<template>
  <div class="sub-sidebar">
    <div class="sub-sidebar__header">
      <div class="sub-sidebar__title">
        {{ navStore.currentSubmenu.label }}
      </div>
    </div>
    <div class="sub-sidebar__nav-container">
      <div v-if="hasActionBtn" class="action-btn">
        <n-button type="primary" size="small" :block="true" @click="toogleModal"
          >Добавить категорию</n-button
        >
      </div>
      <n-menu
        v-model:value="selectedKey"
        :builtin-theme-overrides="{ itemHeight: '32px' }"
        class="sub-menu"
        :indent="20"
        :options="navStore.currentSubmenu.items"
      />
    </div>
    <!-- TODO: Переделывать функционал, сайдбар может быть не только в постах, учесть расширяемость и различные типы контента -->
    <teleport to="body">
      <n-modal
        style="max-width: 640px"
        size="medium"
        :title="modalTitle"
        preset="card"
        v-model:show="showModal"
      >
        <slot
          name="modal"
          :first-level-menu-name="navStore.firstLevelName"
          :on-update-menu="updateMenu"
          :on-cancel-modal="toogleModal"
        />
        <!-- <post-category-edit
          @on-cancel="toogleModal"
          @on-update="updateMenu"
          :type="firstLevelMenuName === 'posts' ? 'post' : 'banner'"
        /> -->
      </n-modal>
    </teleport>
  </div>
</template>

<style scoped>
.action-btn {
  padding-inline: 0.5rem;
  margin-bottom: 0.5rem;
}

.sub-sidebar {
  background-color: var(--white);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100vh;
  padding: 1rem 0.5rem;
  width: 240px;
  min-width: 240px;
  position: sticky;
  top: 0px;
  border-right: 1px solid var(--gray-200);
}

.sub-sidebar__nav-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.sub-sidebar__btn-container {
  padding: 0 0.75rem;
}

.sub-sidebar__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0.75rem;
}

.sub-sidebar__title {
  font-weight: 500;
}
</style>
