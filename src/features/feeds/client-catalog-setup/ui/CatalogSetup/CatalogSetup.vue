<script setup lang="ts">
import {
  NCard,
  NSpace,
  NText,
  NButton,
  NIcon,
  NSpin,
  useMessage,
  NModal,
  NFormItem,
  NInput,
  NSwitch,
  NPopover,
  NDropdown
} from 'naive-ui'
import type { SubjectItem } from '../../model/types'
import { useCatalogSetup } from '../../model/use-catalog-setup'
import CategoriesList from './CategoriesList.vue'
import { X as XIcon, InfoCircle, ChevronDown } from '@vicons/tabler'
import { useCopyFilterDataStore } from '../../model/use-copy-filter-data-store'

const { subject } = defineProps<{
  subject: SubjectItem
}>()

const emits = defineEmits<{
  (e: 'onClose'): void
}>()

const isExpanded = ref(false)

const showPeriodSetting = ref(false)

const {
  loading,
  categoriesData,
  saveFilterSubject,
  brandsFilter,
  updateBrandsFilter,
  saveFilterSubjectStatus,
  startDate,
  finishDate,
  finishDateFormatted,
  startDateFormatted,
  resetDateRange,
  clearDateRange,
  isStrong,
  filterData,
  pasteFilterData
} = useCatalogSetup(() => subject)

const message = useMessage()

async function saveFilterSubjectHandler() {
  await saveFilterSubject()

  if (saveFilterSubjectStatus.value === 'success') {
    message.success('Настройка успешно сохранена')
  } else if (saveFilterSubjectStatus.value === 'error') {
    message.success('Произошла ошибка')
  }
}

function savePeriodSettingHandler() {
  if ((startDate.value && !finishDate.value) || (!startDate.value && finishDate.value)) {
    message.error('Необходимо заполнить все поля')
    return
  }

  if (new Date(startDate.value) > new Date(finishDate.value)) {
    message.error('Начало периода не может быть позже конца периода')
    return
  }

  showPeriodSetting.value = false
}

function cancelPeriodSettingHandler() {
  resetDateRange()
  showPeriodSetting.value = false
}

const copyFilterDataStore = useCopyFilterDataStore()

const moreMenu = computed(() => {
  return [
    {
      label: 'Копировать настройку',
      key: 'copy'
    },
    {
      label: 'Вставить настройку',
      key: 'paste',
      disabled: copyFilterDataStore.copyFilterData == null
    }
  ]
})

function handleSelectMoreMenu(key: string | number) {
  if (!filterData.value) {
    return
  }

  if (key === 'copy') {
    copyFilterDataStore.setCopyFilterData({
      finishDate: filterData.value.data.finishDate,
      startDate: filterData.value.data.startDate,
      categories: filterData.value.data.categories,
      isStrong: filterData.value.data.isStrong
    })

    message.success('Настройка скопирована')
  } else if (key === 'paste') {
    pasteFilterData()
    message.success('Настройка вставлена')
  }
}
</script>

<template>
  <n-space vertical>
    <div v-if="copyFilterDataStore.copyFilterData != null" class="copyfilter-container">
      <div class="copyfilter-container__title">
        <n-text :depth="2">Скопирована настройка:</n-text>
      </div>
      <div class="copyfilter-container__actions">
        <n-button quaternary size="small" type="primary"> Вставить настройку </n-button>
        <n-button quaternary size="small" type="error"> Сбросить </n-button>
      </div>
    </div>

    <n-card>
      <n-space vertical>
        <div class="subject-info-header" justify="space-between" align="start">
          <div class="subject-info">
            <h2>{{ subject.name }}</h2>
            <div class="subject-info-details">
              <n-text :depth="3">Код: {{ subject.code || '-' }}</n-text>
              <n-text :depth="3">ИНН: {{ subject.inn || '-' }}</n-text>
              <n-text :depth="3">ТА: {{ subject.taemail || '-' }}</n-text>
            </div>
          </div>

          <div class="action-group">
            <n-button
              size="medium"
              type="primary"
              :disabled="loading"
              :loading="saveFilterSubjectStatus === 'pending'"
              @click="saveFilterSubjectHandler"
            >
              Сохранить настройку
            </n-button>
            <n-dropdown trigger="hover" :options="moreMenu" @select="handleSelectMoreMenu">
              <n-button
                size="medium"
                secondary
                type="primary"
                strong
                class="icon-square"
                :disabled="saveFilterSubjectStatus === 'pending' || loading"
              >
                <template #icon>
                  <n-icon size="24px">
                    <ChevronDown />
                  </n-icon>
                </template>
              </n-button>
            </n-dropdown>
            <n-button
              size="medium"
              secondary
              type="primary"
              strong
              :disabled="saveFilterSubjectStatus === 'pending' || loading"
              @click="$emit('onClose')"
            >
              <template #icon>
                <n-icon>
                  <XIcon />
                </n-icon>
              </template>
              Закрыть
            </n-button>
          </div>
        </div>

        <n-space style="margin-bottom: 1rem" size="large" :align="'center'">
          <n-text style="font-size: 1rem" tag="p" strong>Персональный каталог</n-text>
          <n-button size="small" ghost type="default" @click="showPeriodSetting = true">{{
            startDate && finishDate
              ? `Период действия: ${startDateFormatted} - ${finishDateFormatted}`
              : 'Настроить период действия'
          }}</n-button>

          <div class="limit-catalog-container">
            <n-popover style="width: 280px" trigger="hover" placement="bottom">
              <template #trigger>
                <div class="limit-catalog-info">
                  <n-icon size="20px" :component="InfoCircle" />
                  <n-text>Ограничить каталог</n-text>
                </div>
              </template>
              <n-text
                >При включении этой опции, каталог клиента будет ограничен только теми категориями и
                брендами, которые выбраны в настройке.
                <strong>Общий каталог будет недоступен.</strong></n-text
              >
            </n-popover>

            <n-switch v-model:value="isStrong" size="small" />
          </div>
        </n-space>

        <n-spin :show="loading">
          <CategoriesList
            v-if="categoriesData?.data"
            :subject-id="subject.id"
            :expanded-all="isExpanded"
            :brands-filter="brandsFilter"
            @on-update-brands-filter="updateBrandsFilter"
          />
          <div v-else style="height: 100px"></div>
        </n-spin>
      </n-space>

      <n-modal v-model:show="showPeriodSetting" style="max-width: 500px" :mask-closable="false">
        <n-card size="medium" title="Настроить период действия">
          <div class="period-setting-container">
            <n-form-item label="Начало периода">
              <n-input v-model:value="startDate" :input-props="{ type: 'date' }" placeholder="" />
            </n-form-item>
            <n-form-item label="Конец периода">
              <n-input v-model:value="finishDate" :input-props="{ type: 'date' }" placeholder="" />
            </n-form-item>
          </div>
          <template #footer>
            <n-space justify="space-between">
              <n-button type="error" @click="clearDateRange">Сбросить</n-button>
              <n-space justify="end">
                <n-button secondary type="primary" @click="cancelPeriodSettingHandler"
                  >Отменить</n-button
                >
                <n-button type="primary" @click="savePeriodSettingHandler">Сохранить</n-button>
              </n-space>
            </n-space>
          </template>
        </n-card>
      </n-modal>
    </n-card>
  </n-space>
</template>

<style scoped>
.subject-info-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.icon-square {
  width: 34px;
  height: 34px;
}

.period-setting-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.subject-info {
}

.subject-info h2 {
  margin: 0;
}

.action-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.subject-info-details {
  display: flex;
  gap: 0.5rem;
}

.limit-catalog-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.limit-catalog-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.copyfilter-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #afeeee;
  border-radius: 0.5rem;
}

.copyfilter-container__title {
  font-size: 0.875rem; /* 14px */
}

.copyfilter-container__actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}
</style>
