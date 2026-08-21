<script setup lang="ts">
import { NH1, NSpace, NButton, NModal, NCard, NSelect, NFormItem, NIcon } from 'naive-ui'
import {
  CatalogList,
  PresetFilterForm,
  PresetFilterBulkForm,
  getCatalogQueryKey,
  getPresetsQueryKey,
  getVidsQueryKey,
  useCatalogApi,
  groupCatalogItems,
  attachPresetsToCatalog,
  attachVidsToCatalog,
  UploadCatalogItemData
} from '~/entities/catalog'
import { useDownloadTemplate } from '~/entities/catalog/model/use-download-template'
import { useNavStore } from '~/shared/navigation'
import { FileDownload } from '@vicons/tabler'
import type { GetCatalogItemDto } from '~/entities/catalog/api/catalog-schemas'
import { useWindowSize } from '@vueuse/core'

const navStore = useNavStore()

const api = useCatalogApi()

const { data, status } = await useAsyncData(getCatalogQueryKey(), api.getCatalog)

// fetch all presets (подфильтровые страницы)
const { data: presetsData, refresh: refreshPresets } = await useAsyncData(
  getPresetsQueryKey(),
  api.getPresetsFilters
)

// fetch all vids (виды категорий — третий уровень)
const { data: vidsData } = await useAsyncData(getVidsQueryKey(), () => api.getCatalogVids())

// TODO: refactor
if (status.value === 'error') {
  throw createError({ statusCode: 400, statusMessage: 'Ошибка при загрузке каталога', fatal: true })
}

const titleFilter = ref('')
const aliasFilter = ref('')
const shortDescrFilter = ref('')
const DescrFilter = ref('')

const filtersOptions = [
  { label: 'Все', value: '' },
  { label: 'заполнен', value: 'заполнен' },
  { label: 'незаполнен', value: 'незаполнен' }
]

const filteredByTitle = computed(() => {
  if (!data.value) {
    return []
  }

  if (titleFilter.value === '') {
    return data.value
  }
  if (titleFilter.value === 'заполнен') {
    return data.value?.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.seotitle !== '')
    )
  }

  if (titleFilter.value === 'незаполнен') {
    return data.value?.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.seotitle === '')
    )
  }

  return data.value
})

const filteredByAlias = computed(() => {
  if (aliasFilter.value === '') {
    return filteredByTitle.value
  }
  if (aliasFilter.value === 'заполнен') {
    return filteredByTitle.value.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.alias !== '')
    )
  }
  if (aliasFilter.value === 'незаполнен') {
    return filteredByTitle.value.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.alias === '')
    )
  }
  return filteredByTitle.value
})

const filteredByShortDescr = computed(() => {
  if (shortDescrFilter.value === '') {
    return filteredByAlias.value
  }
  if (shortDescrFilter.value === 'заполнен') {
    return filteredByAlias.value.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.shortDescr !== '')
    )
  }
  if (shortDescrFilter.value === 'незаполнен') {
    return filteredByAlias.value.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.shortDescr === '')
    )
  }
  return filteredByAlias.value
})

const filteredByDescr = computed(() => {
  if (DescrFilter.value === '') {
    return filteredByShortDescr.value
  }
  if (DescrFilter.value === 'заполнен') {
    return filteredByShortDescr.value.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.descr !== '')
    )
  }
  if (DescrFilter.value === 'незаполнен') {
    return filteredByShortDescr.value.filter(
      (item) => item.vid === 'tn' || (item.vid === 'tk' && item.descr === '')
    )
  }
  return filteredByShortDescr.value
})

// group float struct with attach presets and vids
const groupedCatalogItems = computed(() => {
  const grouped = groupCatalogItems<GetCatalogItemDto>(filteredByDescr.value)
  const withPresets = attachPresetsToCatalog(grouped, presetsData.value ?? [])
  return attachVidsToCatalog(withPresets, vidsData.value ?? [])
})

const showUploadFileModal = ref(false)

// modal edit or add preset filter
const showPresetModal = ref(false)
const presetModalParams = ref<{
  catalogItemId: number
  categoryName: string
  presetId: number | null
} | null>(null)

// Форма подфильтровой страницы отдаёт наружу действие сохранения и его статусы,
// т.к. кнопки живут в футере модального окна.
const presetFormRef = useTemplateRef<InstanceType<typeof PresetFilterForm>>('presetFormRef')

const presetSaveDisabled = computed(() => {
  const form = presetFormRef.value
  if (!form) {
    return true
  }
  return form.loadStatus !== 'success' || form.saveDisabled
})
const presetSaveLoading = computed(() => presetFormRef.value?.saveStatus === 'pending')

const presetRemoveVisible = computed(() => presetFormRef.value?.isEditing ?? false)
const presetRemoveLoading = computed(() => presetFormRef.value?.removeStatus === 'pending')

function savePreset() {
  presetFormRef.value?.save()
}

function removePreset() {
  presetFormRef.value?.remove()
}

function openAddPreset(payload: { catalogItemId: number; categoryName: string }) {
  presetModalParams.value = { ...payload, presetId: null }
  showPresetModal.value = true
}

function openEditPreset(payload: {
  catalogItemId: number
  categoryName: string
  presetId: number
}) {
  presetModalParams.value = payload
  showPresetModal.value = true
}

async function onPresetSaved() {
  showPresetModal.value = false
  await refreshPresets()
}

async function onPresetRemoved() {
  showPresetModal.value = false
  await refreshPresets()
}

// modal bulk add preset filters
const showBulkPresetModal = ref(false)
const bulkPresetModalParams = ref<{ catalogItemId: number; categoryName: string } | null>(null)

const bulkFormRef = useTemplateRef<InstanceType<typeof PresetFilterBulkForm>>('bulkFormRef')

const bulkSaveDisabled = computed(() => {
  const form = bulkFormRef.value
  if (!form) {
    return true
  }
  return form.loadStatus !== 'success' || form.saveDisabled
})
const bulkSaveLoading = computed(() => bulkFormRef.value?.saveStatus === 'pending')
const bulkPendingCount = computed(() => bulkFormRef.value?.pendingCount ?? 0)

function saveBulkPresets() {
  bulkFormRef.value?.save()
}

function openBulkPreset(payload: { catalogItemId: number; categoryName: string }) {
  bulkPresetModalParams.value = payload
  showBulkPresetModal.value = true
}

async function onBulkPresetsSaved() {
  showBulkPresetModal.value = false
  await refreshPresets()
}

// templates
const { downloadTemplate, status: downloadStatus, downloadFile } = useDownloadTemplate()

async function downloadCatalog() {
  await downloadTemplate('', 'all')

  if (downloadStatus.value === 'success') {
    const a = document.createElement('a')
    a.href = downloadFile.value?.url ?? ''
    a.download = downloadFile.value?.name ?? ''
    a.click()
  }
}

const { height } = useWindowSize()
const calcHeight = computed(() => height.value - 40)
</script>
<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Главная" has-back :back-path="`/`">
        <template #title>
          <n-h1>
            {{ navStore.currentNavigationMenu?.label }}
          </n-h1>
        </template>
        <template #actions>
          <n-button type="primary" @click="showUploadFileModal = true">Загрузить описание</n-button>
        </template>
      </page-title>
      <div class="layout">
        <CatalogList
          :items="groupedCatalogItems"
          @add-preset="openAddPreset"
          @add-presets-bulk="openBulkPreset"
          @edit-preset="openEditPreset"
        />
        <n-space vertical>
          <n-card>
            <n-button quaternary block @click="downloadCatalog" icon-placement="left">
              <template #icon>
                <n-icon size="24px">
                  <FileDownload />
                </n-icon>
              </template>
              Скачать шаблон каталога
            </n-button>
          </n-card>
          <n-card title="Фильтр">
            <template #header-extra>
              <!-- <n-button
              secondary
              type="info"
              size="small"
              :disabled="!isFiltered"
              @click="clearAllFilters"
              >Сбросить</n-button
            > -->
            </template>
            <div class="filters-layout">
              <n-form-item label="Title">
                <n-select v-model:value="titleFilter" :options="filtersOptions" />
              </n-form-item>
              <n-form-item label="Alias">
                <n-select v-model:value="aliasFilter" :options="filtersOptions" />
              </n-form-item>
              <n-form-item label="Description">
                <n-select v-model:value="shortDescrFilter" :options="filtersOptions" />
              </n-form-item>
              <n-form-item label="Текстовое описание">
                <n-select v-model:value="DescrFilter" :options="filtersOptions" />
              </n-form-item>
            </div>
          </n-card>
        </n-space>
      </div>
    </n-space>

    <n-modal
      preset="card"
      v-model:show="showUploadFileModal"
      title="Загрузить описание"
      style="max-width: 640px"
      size="medium"
      :bordered="false"
    >
      <UploadCatalogItemData @on-cancel="showUploadFileModal = false" />
    </n-modal>

    <n-modal
      preset="card"
      v-model:show="showBulkPresetModal"
      title="Добавить множество подфильтровых страниц"
      :style="{ width: '960px', height: `${calcHeight}px` }"
      content-scrollable
      :segmented="{ content: true, footer: true }"
      size="medium"
      :bordered="false"
    >
      <PresetFilterBulkForm
        v-if="showBulkPresetModal && bulkPresetModalParams"
        ref="bulkFormRef"
        :catalog-item-id="bulkPresetModalParams.catalogItemId"
        :category-name="bulkPresetModalParams.categoryName"
        @on-saved="onBulkPresetsSaved"
        @on-refresh="refreshPresets"
        @on-cancel="showBulkPresetModal = false"
      />
      <template #footer>
        <n-space justify="end">
          <n-button attr-type="button" secondary type="primary" @click="showBulkPresetModal = false"
            >Отменить</n-button
          >
          <n-button
            attr-type="button"
            type="primary"
            :disabled="bulkSaveDisabled"
            :loading="bulkSaveLoading"
            @click="saveBulkPresets"
            >Создать<template v-if="bulkPendingCount"> ({{ bulkPendingCount }})</template></n-button
          >
        </n-space>
      </template>
    </n-modal>

    <n-modal
      preset="card"
      v-model:show="showPresetModal"
      :title="
        presetModalParams?.presetId
          ? 'Редактировать подфильтровую страницу'
          : 'Новая подфильтровая страница'
      "
      :style="{ width: '720px', height: `${calcHeight}px` }"
      content-scrollable
      :segmented="{ content: true, footer: true }"
      size="medium"
      :bordered="false"
    >
      <PresetFilterForm
        v-if="showPresetModal && presetModalParams"
        ref="presetFormRef"
        :catalog-item-id="presetModalParams.catalogItemId"
        :category-name="presetModalParams.categoryName"
        :preset-id="presetModalParams.presetId"
        @on-saved="onPresetSaved"
        @on-removed="onPresetRemoved"
        @on-cancel="showPresetModal = false"
      />
      <template #footer>
        <n-space justify="space-between">
          <n-button
            v-if="presetRemoveVisible"
            attr-type="button"
            secondary
            type="error"
            :disabled="presetRemoveLoading"
            :loading="presetRemoveLoading"
            @click="removePreset"
            >Удалить</n-button
          >
          <span v-else></span>
          <n-space>
            <n-button attr-type="button" secondary type="primary" @click="showPresetModal = false"
              >Отменить</n-button
            >
            <n-button
              attr-type="button"
              type="primary"
              :disabled="presetSaveDisabled"
              :loading="presetSaveLoading"
              @click="savePreset"
              >Сохранить</n-button
            >
          </n-space>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr minmax(240px, 320px);
  gap: 1rem;
}
</style>
