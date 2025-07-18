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

const link = 'https://isantur.ru/Client/GetCatalogFeed'

const currentPlatform = ref('YAND')
const platformOptions = [{ label: 'Яндекс', value: 'YAND' }]

const tabs = ['Каталог', 'Бренды'] as const
const activeTab = ref<(typeof tabs)[number]>('Каталог')

const api = useUploadingApi()
const { getCatalog } = useCatalogApi()

const {
  data: exportConstructor,
  status: exportConstructorStatus,
  refresh: refreshExportConstructor
} = useAsyncData('export-constructor', () => api.getExportConstructor(currentPlatform.value), {
  lazy: true
})

const {
  data: catalogData,
  status: catalogDataStatus,
  execute: catalogDataExecute
} = useAsyncData('catalog-struct', getCatalog, {
  transform: (data) => {
    const mapped = data.map((item) => ({
      id: item.id,
      name: item.name,
      parent_id: item.parent_id,
      vid: item.vid,
      isChecked: !exportConstructor.value?.excludedCategories?.includes(item.id) || true
    }))

    return { data: groupCatalogItems(mapped), fetchedAt: new Date() }
  },
  immediate: false
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

const openInNewTabHandler = () => {
  window.open(link, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(link)
}

const { saveConstructor, status: saveConstructorStatus } = useSaveConstructor()

const message = useMessage()

async function updateHandler() {
  if (!catalogData.value?.data || !exportConstructor.value) {
    return
  }

  const excludedCategories = getExcludedCategoryIds(catalogData.value.data)
  const excludedBrends = getExcludedBrandsNames()

  await saveConstructor(currentPlatform.value, {
    excludedCategories,
    excludedBrends,
    znaks: exportConstructor.value.znaks
  })

  if (saveConstructorStatus.value === 'success') {
    message.success('Данные успешно сохранены')
  } else {
    message.error('Произошла ошибка при сохранении')
  }

  const invalidatedKeys = getInvalidatedKeys(excludedCategories, excludedBrends)

  await refreshExportConstructor()

  clearNuxtData(invalidatedKeys)
}

function getInvalidatedKeys(catIds: number[], _brands: string[]) {
  const invalidatedKeys: string[] = []

  if (JSON.stringify(catIds) !== JSON.stringify(exportConstructor.value?.excludedCategories)) {
    invalidatedKeys.push('catalog-struct')
  }

  // TODO: Реализовать проверку по брендам

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

function getExcludedBrandsNames() {
  // TODO: Реализовать
  return exportConstructor.value?.excludedBrends || []
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
                <XmlFeedCatalog v-if="catalogData?.data" v-model:state="catalogData.data" />
              </n-tab-pane>
              <n-tab-pane :name="tabs[1]" :tab="tabs[1]"> В разработке </n-tab-pane>
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
