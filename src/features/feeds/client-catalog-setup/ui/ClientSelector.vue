<script setup lang="ts">
import { NCard, NSpace, NInput, NPopover, NList, NListItem, NText, NIcon, NSelect } from 'naive-ui'
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
    <n-space>
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
                @focus="focusHandler"
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
              @click="selectSubjectHandler(item)"
            >
              {{ item.name }}
            </n-list-item>
          </n-list>
          <n-text tag="p" style="text-align: center" v-else>Ничего не найдено</n-text>
        </n-popover>
      </div>
      <!-- <div class="select-container">
        <n-space vertical>
          <n-text strong>Выбрать ответсвенного менеджера</n-text>
          <n-select
            v-model:value=""
            filterable
            placeholder="Please select a song"
            :options=""
          />
        </n-space>
      </div> -->
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
