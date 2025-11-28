<script setup lang="ts">
import { NCard, NSpace, NInput, NPopover, NList, NListItem, NText, NIcon, NModal } from 'naive-ui'
import { Search } from '@vicons/tabler'
import { useSearchSubject } from '../model/use-search-subject'
import type { ManagerItem, SubjectItem } from '../model/types'
import { useSearchManagers } from '../model/use-search-managers'
import { useSelectSubjectByManager } from '../model/use-select-subject-by-manager'
import ClientListModal from './ClientListModal.vue'

const emits = defineEmits<{
  (e: 'onSelectSubject', subject: SubjectItem): void
}>()

const {
  searchValue,
  isOpenPopover,
  closePopover,
  openPopover,
  searchSubjectsResult,
  clearSearchValue,
  resetStatus,
  searchStatus
} = useSearchSubject()

const {
  searchValue: searchManagersValue,
  clearSearchValue: clearSearchManagersValue,
  closePopover: closeManagersPopover,
  openPopover: openManagersPopover,
  searchManagersResult,
  isOpenPopover: isOpenManagersPopover,
  resetStatus: resetManagersStatus,
  searchStatus: searchManagersStatus
} = useSearchManagers()

const {
  clearSelectedManager,
  selectedManagerEmail,
  toggleSubjectsModal,
  setSelectedManagerEmail,
  isOpenSubjectsModal
} = useSelectSubjectByManager()

function focusSubjectInputHandler() {
  if (searchSubjectsResult.value.length > 0) {
    openPopover()
  }
}

function selectSubjectFromPopoverHandler(subj: SubjectItem) {
  resetStatus()
  clearSearchValue()
  closePopover()
  emits('onSelectSubject', subj)
}

function focusManagersInputHandler() {
  if (searchManagersResult.value.length > 0) {
    openManagersPopover()
  }
}

function selectManagerFromPopoverHandler(manager: ManagerItem) {
  // resetManagersStatus()
  // clearSearchManagersValue()
  // closeManagersPopover()
  // emits('onSelectSubject', subj)

  closeManagersPopover()
  setSelectedManagerEmail(manager.email)
  toggleSubjectsModal()
}
</script>

<template>
  <n-card>
    <n-space size="large">
      <div class="search-container">
        <n-popover
          style="max-height: 320px"
          width="trigger"
          trigger="manual"
          scrollable
          placement="bottom"
          :show-arrow="false"
          :show="isOpenPopover"
          @clickoutside="closePopover"
        >
          <template #trigger>
            <n-space vertical>
              <n-text strong>Поиск клиента по названию, коду 1С или ИНН</n-text>
              <n-input
                v-model:value="searchValue"
                size="large"
                type="text"
                placeholder="Найти..."
                :loading="searchStatus === 'pending'"
                @focus="focusSubjectInputHandler"
              >
                <template #prefix>
                  <n-icon size="20">
                    <Search color="#1976d2" />
                  </n-icon>
                </template>
              </n-input>
            </n-space>
          </template>
          <n-list v-if="searchSubjectsResult.length > 0" hoverable clickable>
            <n-list-item
              v-for="item in searchSubjectsResult"
              :key="item.id"
              @click="selectSubjectFromPopoverHandler(item)"
            >
              {{ item.name }}
            </n-list-item>
          </n-list>
          <n-text tag="p" style="text-align: center" v-else>Ничего не найдено</n-text>
        </n-popover>
      </div>
      <div class="search-container">
        <!-- <n-space vertical> -->
        <!-- <n-text strong>Выбрать ответсвенного менеджера</n-text> -->
        <!-- <n-select v-model:value="selectedValue" filterable placeholder="" :options="" /> -->
        <!-- </n-space> -->

        <n-popover
          style="max-height: 320px"
          width="trigger"
          trigger="manual"
          scrollable
          placement="bottom"
          :show-arrow="false"
          :show="isOpenManagersPopover"
          @clickoutside="closeManagersPopover"
        >
          <template #trigger>
            <n-space vertical>
              <n-text strong>Поиск менеджера</n-text>
              <n-input
                v-model:value="searchManagersValue"
                size="large"
                type="text"
                placeholder="Найти..."
                :loading="searchManagersStatus === 'pending'"
                @focus="focusManagersInputHandler"
              >
                <template #prefix>
                  <n-icon size="20">
                    <Search color="#1976d2" />
                  </n-icon>
                </template>
              </n-input>
            </n-space>
          </template>
          <n-list v-if="searchManagersResult.length > 0" hoverable clickable>
            <n-list-item
              v-for="item in searchManagersResult"
              :key="item.name"
              @click="selectManagerFromPopoverHandler(item)"
            >
              {{ item.name }}
            </n-list-item>
          </n-list>
          <n-text tag="p" style="text-align: center" v-else>Ничего не найдено</n-text>
        </n-popover>
      </div>
    </n-space>

    <n-modal
      v-model:show="isOpenSubjectsModal"
      style="max-width: 640px"
      size="medium"
      preset="card"
      title="Выбор клиента"
      :mask-closable="false"
    >
      <ClientListModal v-if="selectedManagerEmail" :selected-manager-email="selectedManagerEmail" />
    </n-modal>
  </n-card>
</template>

<style scoped>
.search-container {
  width: 360px;
}

.search-container h4 {
  margin: 0;
}
</style>
