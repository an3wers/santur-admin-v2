<script setup lang="ts">
import { NH1, NSpace, NButton, NModal, NCard, NSelect, NFormItem, NIcon } from 'naive-ui'
import {
  CatalogList,
  PresetFilterForm,
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
      v-model:show="showPresetModal"
      :title="
        presetModalParams?.presetId
          ? 'Редактировать подфильтровую страницу'
          : 'Новая подфильтровая страница'
      "
      style="max-width: 720px"
      size="medium"
      :bordered="false"
    >
      <PresetFilterForm
        v-if="showPresetModal && presetModalParams"
        :catalog-item-id="presetModalParams.catalogItemId"
        :category-name="presetModalParams.categoryName"
        :preset-id="presetModalParams.presetId"
        @on-saved="onPresetSaved"
        @on-cancel="showPresetModal = false"
      />
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
