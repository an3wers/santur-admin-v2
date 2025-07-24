<script setup lang="ts">
import {
  NCard,
  NInput,
  NButton,
  NIcon,
  NSelect,
  NSpace,
  NSpin,
  useMessage,
  NTabs,
  NTabPane
} from 'naive-ui'
import { Copy, ExternalLink } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'
import XmlFeedCatalog from './XmlFeedCatalog.vue'
import { groupCatalogItems, useCatalogApi } from '~/entities/catalog'
import type { CatalogItem } from '../../model/types'
import { useSaveConstructor, useUploadingApi } from '~/entities/uploading'
import XmlFeedZnaks from './XmlFeedZnaks.vue'
import XmlFeedBrands from './XmlFeedBrands.vue'
import { BrandLatters } from '~/widgets/brand'
import { useBrands } from '../../model/use-brands'

const currentPlatform = ref('YAND')
const platformOptions = [{ label: 'Яндекс', value: 'YAND' }]

const link = computed(() => `https://isantur.ru/Client/GetCatalogFeed?key=${currentPlatform.value}`)

const tabs = ['Каталог', 'Бренды'] as const
const activeTab = ref<(typeof tabs)[number]>('Каталог')

const api = useUploadingApi()
const { getCatalog } = useCatalogApi()

const {
  data: exportConstructor,
  status: exportConstructorStatus,
  refresh: refreshExportConstructor
} = useAsyncData(
  'export-constructor-xml-feed',
  () => api.getExportConstructor(currentPlatform.value),
  {
    lazy: true
  }
)

const {
  data: catalogData,
  status: catalogDataStatus,
  execute: catalogDataExecute
} = useAsyncData('catalog-xml-feed', getCatalog, {
  transform: (data) => {
    const mapped = data.map((item) => ({
      id: item.id,
      name: item.name,
      parent_id: item.parent_id,
      vid: item.vid,
      isChecked: !exportConstructor.value?.excludedCategories?.includes(item.id)
    }))

    return { data: groupCatalogItems(mapped), fetchedAt: new Date() }
  },
  immediate: false
})

const {
  excludedBrands,
  toggleExcludedBrand,
  initExcludedBrands,
  lettersRus,
  lettersEng,
  brands,
  getBrands,
  currentLetter,
  status: brandsStatus,
  setLetter,
  resetState: resetBrandsState
} = useBrands()

watchEffect(() => {
  if (exportConstructorStatus.value === 'success') {
    initExcludedBrands(exportConstructor.value?.excludedBrends || [])
  }
})

watchEffect(() => {
  if (
    activeTab.value === 'Каталог' &&
    catalogDataStatus.value === 'idle' &&
    exportConstructorStatus.value === 'success'
  ) {
    catalogDataExecute()
  }
})

watchEffect(() => {
  if (
    activeTab.value === 'Бренды' &&
    brandsStatus.value === 'idle' &&
    exportConstructorStatus.value === 'success'
  ) {
    getBrands()
  }
})

const openInNewTabHandler = () => {
  window.open(link.value, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(link.value)
}

const { saveConstructor, status: saveConstructorStatus } = useSaveConstructor()

const message = useMessage()

async function updateHandler() {
  if (!catalogData.value?.data || !exportConstructor.value) {
    return
  }

  const excludedCategories = getExcludedCategoryIds(catalogData.value.data)

  await saveConstructor(currentPlatform.value, {
    excludedCategories,
    excludedBrends: excludedBrands.value,
    znaks: exportConstructor.value.znaks
  })

  if (saveConstructorStatus.value === 'success') {
    message.success('Данные успешно сохранены')
  } else {
    message.error('Произошла ошибка при сохранении')
  }

  const invalidatedKeys = getInvalidatedKeys(excludedCategories)
  resetBrandsState()

  await refreshExportConstructor()
  clearNuxtData(invalidatedKeys)
}

function getInvalidatedKeys(catIds: number[]) {
  const invalidatedKeys: string[] = []

  if (JSON.stringify(catIds) !== JSON.stringify(exportConstructor.value?.excludedCategories)) {
    invalidatedKeys.push('catalog-xml-feed')
  }

  return invalidatedKeys
}

function getExcludedCategoryIds(payload: CatalogItem[]): number[] {
  if (!payload.length) {
    return []
  }

  const result: number[] = []
  payload.forEach((item) => {
    if (item.child) {
      item.child.forEach((c) => {
        if (!c.isChecked) {
          result.push(c.id)
        }
      })
    }
  })

  return result
}

function toggleCheckedAllInCategory(catId: number) {
  catalogData.value?.data?.forEach((item) => {
    if (item.id === catId) {
      const isCheckedAll = item.child?.every((c) => c.isChecked)

      if (isCheckedAll) {
        item.child?.forEach((c) => {
          c.isChecked = false
        })
      } else {
        item.child?.forEach((c) => {
          c.isChecked = true
        })
      }
    }
  })
}
</script>

<template>
  <n-space vertical size="large">
    <n-spin :show="exportConstructorStatus === 'pending'">
      <n-card>
        <n-space vertical size="medium">
          <div class="row">
            <n-select
              class="row__select"
              v-model:value="currentPlatform"
              :options="platformOptions"
            />
          </div>
          <div class="row">
            <n-input class="row__input" :value="link" readonly />
            <div class="row__btns">
              <n-button ghost @click="openInNewTabHandler">
                <n-icon size="20px" :component="ExternalLink" />
              </n-button>
              <n-button ghost @click="copyHandler">
                <n-icon size="20px" :component="Copy" />
              </n-button>
              <n-button type="primary" @click="updateHandler">Обновить выгрузку</n-button>
            </div>
          </div>
        </n-space>
      </n-card>
    </n-spin>
    <div v-if="exportConstructor">
      <div class="constructor-grid">
        <div class="constructor-grid__item">
          <n-card>
            <n-tabs v-model:value="activeTab" type="line" size="large">
              <n-tab-pane :name="tabs[0]" :tab="tabs[0]">
                <n-space justify="center" v-if="catalogDataStatus === 'pending'">
                  <n-spin size="small" />
                </n-space>
                <XmlFeedCatalog
                  v-if="catalogData?.data"
                  v-model:state="catalogData.data"
                  @on-toggle-check-all-in-category="toggleCheckedAllInCategory"
                />
              </n-tab-pane>
              <n-tab-pane :name="tabs[1]" :tab="tabs[1]">
                <XmlFeedBrands
                  :data="brands?.brends || []"
                  :status="brandsStatus"
                  @on-update="toggleExcludedBrand"
                >
                  <template #letters>
                    <BrandLatters
                      v-if="lettersEng.length || lettersRus.length"
                      :letters-eng="lettersEng"
                      :letters-rus="lettersRus"
                      :status="brandsStatus"
                      :current-letter="currentLetter"
                      @on-letter-click="setLetter($event)"
                    />
                  </template>
                </XmlFeedBrands>
              </n-tab-pane>
            </n-tabs>
          </n-card>
        </div>
        <div class="constructor-grid__item">
          <XmlFeedZnaks v-model:state="exportConstructor.znaks" />
        </div>
      </div>
    </div>
  </n-space>
</template>

<style scoped>
.row {
  display: flex;
  gap: 0.5rem;
}

.row__select {
  max-width: 240px;
  flex-shrink: 1;
}

.row__input {
  max-width: 320px;
  flex-shrink: 1;
}

.row__btns {
  display: flex;
  gap: 0.5rem;
}

.constructor-grid {
  display: grid;
  grid-template-columns: 1fr minmax(240px, 320px);
  gap: 1rem;
}
</style>
