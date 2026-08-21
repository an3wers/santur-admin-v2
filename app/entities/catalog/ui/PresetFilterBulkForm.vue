<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NSpace,
  NSpin,
  NCheckbox,
  NCheckboxGroup,
  NText,
  NAlert,
  NSwitch,
  NSelect,
  NCollapse,
  NCollapseItem,
  NPopover,
  NButton,
  NTag,
  NProgress,
  NDataTable,
  useMessage,
  type DataTableColumns,
  type DataTableRowKey
} from 'naive-ui'
import { h } from 'vue'
import { usePresetFilterBulkForm } from '../model/use-preset-filter-bulk-form'
import type { BulkPresetRow } from '../libs/build-preset-combinations'

const props = defineProps<{
  catalogItemId: number
  categoryName: string
}>()

const emit = defineEmits<{
  (e: 'onSaved'): void
  (e: 'onRefresh'): void
  (e: 'onCancel'): void
}>()

const {
  charFilters,
  selections,
  axisName,
  axisCandidates,
  setAxis,
  includeCategoryInTitle,
  location,
  locations,
  rows,
  checkedRowKeys,
  setCheckedRowKeys,
  selectedRows,
  results,
  progress,
  successCount,
  failedKeys,
  loadStatus,
  saveStatus,
  open,
  save,
  retryFailed
} = usePresetFilterBulkForm()

const message = useMessage()

onMounted(() => {
  open({
    catalogItemId: props.catalogItemId,
    categoryName: props.categoryName
  })
})

// Уже созданные строки в повторную отправку не идут, поэтому кнопку «Создать»
// считаем по числу ещё не сохранённых отмеченных страниц.
const pendingCount = computed(
  () => selectedRows.value.filter((row) => results.value[row.key]?.status !== 'success').length
)

watch(saveStatus, (value) => {
  if (value === 'success') {
    message.success(`Создано подфильтровых страниц: ${successCount.value}`)
    emit('onSaved')
  }

  if (value === 'error') {
    message.error(`Создано: ${successCount.value}. Не удалось создать: ${failedKeys.value.length}`)
    if (successCount.value > 0) {
      emit('onRefresh')
    }
  }
})

/*
  ПРЕВЬЮ
*/

const rowKey = (row: BulkPresetRow) => row.key

function checkedRowKeysHandler(keys: DataTableRowKey[]) {
  setCheckedRowKeys(keys)
}

const previewColumns = computed<DataTableColumns<BulkPresetRow>>(() => {
  // Читаем результаты здесь, чтобы таблица перерисовывалась по ходу сохранения
  const currentResults = results.value
  const isSaving = saveStatus.value === 'pending'

  return [
    {
      type: 'selection',
      disabled: (row) => isSaving || currentResults[row.key]?.status === 'success'
    },
    {
      title: 'Заголовок',
      key: 'title',
      ellipsis: { tooltip: true }
    },
    {
      title: 'Alias',
      key: 'alias',
      ellipsis: { tooltip: true }
    },
    {
      title: 'Фильтры',
      key: 'filtersLabel',
      ellipsis: { tooltip: true }
    },
    {
      title: 'Статус',
      key: 'status',
      width: 240,
      render(row) {
        const result = currentResults[row.key]

        if (result?.status === 'success') {
          return h(NTag, { type: 'success', size: 'small' }, { default: () => 'создано' })
        }

        if (result?.status === 'error') {
          return h(
            NTag,
            { type: 'error', size: 'small' },
            { default: () => result.message ?? 'ошибка' }
          )
        }

        if (row.duplicateOf) {
          return h(
            NTag,
            { type: 'warning', size: 'small' },
            { default: () => `дубль: ${row.duplicateOf?.title}` }
          )
        }

        if (row.aliasCollision) {
          return h(
            NTag,
            { type: 'error', size: 'small' },
            { default: () => 'alias совпадает с другой строкой' }
          )
        }

        return null
      }
    }
  ]
})

const progressPercentage = computed(() =>
  progress.value.total ? Math.round((progress.value.done / progress.value.total) * 100) : 0
)

// Кнопки формы вынесены в футер модального окна родителя.
const saveDisabled = computed(
  () => loadStatus.value !== 'success' || pendingCount.value === 0 || saveStatus.value === 'pending'
)

defineExpose({
  save,
  saveStatus,
  saveDisabled,
  loadStatus,
  pendingCount
})

// Раскрываем первую группу фильтров, чтобы форма не выглядела пустой.
const expandedFilterGroups = ref<string[]>([])

watch(loadStatus, (value) => {
  if (value !== 'success') {
    return
  }
  expandedFilterGroups.value = charFilters.value.slice(0, 1).map((charFilter) => charFilter.name)
})
</script>

<template>
  <div style="position: relative">
    <n-spin :show="loadStatus === 'pending'">
      <n-form>
        <n-form-item
          label="Заголовки страниц"
          feedback="Заголовок и alias формируются автоматически из отмеченных фильтров. Тексты, описание и изображение задаются позже в форме отдельной страницы."
        >
          <n-space align="center">
            <n-switch v-model:value="includeCategoryInTitle" size="small" />
            <n-text> Добавить название категории </n-text>
          </n-space>
        </n-form-item>
        <n-form-item label="Расположение на странице">
          <n-select v-model:value="location" :options="locations" />
        </n-form-item>

        <n-text class="section-label">Фильтры</n-text>
        <n-form-item :show-feedback="false">
          <n-collapse
            v-model:expanded-names="expandedFilterGroups"
            :trigger-areas="['main', 'arrow']"
            style="width: 100%"
          >
            <n-collapse-item
              v-for="charFilter in charFilters"
              :key="charFilter.nn"
              :name="charFilter.name"
            >
              <template #header>
                <n-text strong>{{ charFilter.name }}</n-text>
              </template>
              <template #header-extra>
                <n-space align="center" :size="12">
                  <n-text v-if="selections[charFilter.name]?.length" depth="3">
                    выбрано: {{ selections[charFilter.name]?.length }}
                  </n-text>
                  <n-popover placement="bottom" trigger="hover">
                    <template #trigger>
                      <div class="axis-switch">
                        <n-switch
                          size="small"
                          :value="axisName === charFilter.name"
                          :disabled="!axisCandidates.includes(charFilter.name)"
                          @update:value="(value) => setAxis(charFilter.name, value)"
                        />
                        <n-text
                          :depth="axisCandidates.includes(charFilter.name) ? 1 : 3"
                          style="font-size: 12px"
                        >
                          отдельная страница на значение
                        </n-text>
                      </div>
                    </template>
                    <span v-if="axisCandidates.includes(charFilter.name)">
                      По каждому отмеченному значению этого фильтра будет создана своя страница.
                      Остальные отмеченные фильтры попадут в каждую страницу.
                    </span>
                    <span v-else> Отметьте минимум два значения в этом фильтре </span>
                  </n-popover>
                </n-space>
              </template>
              <n-checkbox-group v-model:value="selections[charFilter.name]">
                <n-space item-style="display: flex;">
                  <n-checkbox
                    v-for="item in charFilter.items"
                    :key="item.nn"
                    :value="item.name"
                    :label="`${item.name} (${item.qtyRecords})`"
                  />
                </n-space>
              </n-checkbox-group>
            </n-collapse-item>
          </n-collapse>
        </n-form-item>

        <n-alert v-if="!axisName" type="info" :show-icon="true" style="margin-top: 1.5rem">
          Отметьте фильтры и включите переключатель «отдельная страница на значение» у той группы,
          по которой нужно развернуть серию страниц.
        </n-alert>

        <template v-else>
          <n-space align="center" justify="space-between" style="margin-top: 1.5rem">
            <n-text class="section-label">Будет создано страниц: {{ rows.length }}</n-text>
            <n-text v-if="checkedRowKeys.length !== rows.length" depth="3" style="font-size: 12px">
              отмечено: {{ checkedRowKeys.length }}
            </n-text>
          </n-space>

          <n-data-table
            style="margin-top: 0.5rem"
            size="small"
            :columns="previewColumns"
            :data="rows"
            :row-key="rowKey"
            :checked-row-keys="checkedRowKeys"
            :max-height="320"
            :single-line="false"
            @update:checked-row-keys="checkedRowKeysHandler"
          />

          <n-progress
            v-if="saveStatus === 'pending'"
            style="margin-top: 1rem"
            type="line"
            :percentage="progressPercentage"
            :height="8"
          />
          <n-text v-if="saveStatus === 'pending'" depth="3" style="font-size: 12px">
            Сохранено {{ progress.done }} из {{ progress.total }}
          </n-text>

          <n-alert
            v-if="saveStatus === 'error'"
            type="warning"
            :show-icon="true"
            style="margin-top: 1rem"
          >
            <n-space align="center" justify="space-between">
              <span>
                Создано: {{ successCount }}. Не удалось создать: {{ failedKeys.length }}.
              </span>
              <n-button secondary size="small" @click="retryFailed">Повторить неудачные</n-button>
            </n-space>
          </n-alert>
        </template>
      </n-form>
    </n-spin>
  </div>
</template>

<style scoped>
.section-label {
  font-size: 1rem;
  font-weight: 600;
}

.axis-switch {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
