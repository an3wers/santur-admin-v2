<script setup lang="ts">
import { NCard, NSpace, NInput, NPopover, NList, NListItem, NText, NIcon } from 'naive-ui'
import { Search } from '@vicons/tabler'
import { useSearchSubject } from '../model/use-search-subject'
import type { SubjectItem } from '../model/types'

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

function focusHandler() {
  if (searchSubjectsResult.value.length > 0) {
    openPopover()
  }
}

function selectSubjectHandler(subj: SubjectItem) {
  resetStatus()
  clearSearchValue()
  closePopover()
  emits('onSelectSubject', subj)
}
</script>

<template>
  <n-card>
    <n-space vertical>
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
              <n-text as="h4">Поиск клиента по названию, коду или ИНН</n-text>
              <n-input
                v-model:value="searchValue"
                size="large"
                type="text"
                placeholder="Найти контрагента"
                :loading="searchStatus === 'pending'"
                @focus="focusHandler"
              >
                <template #prefix>
                  <n-icon size="24">
                    <Search color="#94a3b8" />
                  </n-icon>
                </template>
              </n-input>
            </n-space>
          </template>
          <n-list v-if="searchSubjectsResult.length > 0" hoverable clickable>
            <n-list-item
              v-for="item in searchSubjectsResult"
              :key="item.id"
              @click="selectSubjectHandler(item)"
            >
              {{ item.name }}
            </n-list-item>
          </n-list>
          <n-text as="p" style="text-align: center" v-else>Ничего не найдено</n-text>
        </n-popover>
      </div>
    </n-space>
  </n-card>
</template>

<style scoped>
.search-container {
  max-width: 360px;
}

.search-container h4 {
  margin: 0;
}
</style>
