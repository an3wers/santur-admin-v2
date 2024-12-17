<script setup lang="ts">
import { type MenuOption, NModal, NButton, NMenu } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'

interface Props {
  title: string
  firstLevelMenuName: string
  categories?: MenuOption[]
}

const { title, firstLevelMenuName, categories = [] } = defineProps<Props>()

const navStore = useNavStore()

const modalTitle = 'Добавить категорию'
const route = useRoute()

const slug = route.params?.catId as string | undefined

const selectedKey = ref(-1)

if (slug) {
  selectedKey.value = Number(slug)
}

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
    firstLevelMenuName === 'posts' ||
    firstLevelMenuName === 'banners' ||
    firstLevelMenuName === 'pvzs'
  )
})
</script>
<template>
  <div class="sub-sidebar">
    <div class="sub-sidebar__header">
      <div class="sub-sidebar__title">
        {{ title }}
      </div>
    </div>
    <div class="sub-sidebar__nav-container">
      <div v-if="hasActionBtn" class="action-btn">
        <n-button :block="true" @click="toogleModal" type="default">Добавить </n-button>
      </div>
      <n-menu
        v-model:value="selectedKey"
        :builtin-theme-overrides="{ itemHeight: '32px' }"
        class="sub-menu"
        :indent="20"
        :options="categories"
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
