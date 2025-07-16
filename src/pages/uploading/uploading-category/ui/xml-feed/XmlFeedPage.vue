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
import { getCatalogQueryKey } from '~/entities/catalog'
import type { CatalogItem } from '../../model/types'
import { useSaveConstructor, useUploadingApi } from '~/entities/uploading'
import XmlFeedZnaks from './XmlFeedZnaks.vue'

const link = 'https://isantur.ru/Client/GetCatalogFeed'

const currentPlatform = ref('YAND')
const platformOptions = [{ label: 'Яндекс', value: 'YAND' }]

const api = useUploadingApi()

const {
  data: exportConstructor,
  status: exportConstructorStatus,
  refresh: refreshExportConstructor
} = useAsyncData(() => api.getExportConstructor(currentPlatform.value))

const openInNewTabHandler = () => {
  window.open(link, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(link)
}

const { data: catalogData } = useNuxtData<CatalogItem[]>(`${getCatalogQueryKey()}-feed`)
const { saveConstructor, status: saveConstructorStatus } = useSaveConstructor()
const message = useMessage()
async function updateHandler() {
  if (!catalogData.value) {
    return
  }

  if (!exportConstructor.value) {
    return
  }

  const catalog = getCatalogIds(catalogData.value)
  const brends = getBrandsNames()

  await saveConstructor(currentPlatform.value, {
    catalog,
    brends,
    znaks: exportConstructor.value.znaks
  })

  if (saveConstructorStatus.value === 'success') {
    message.success('Данные успешно сохранены')
  } else {
    message.error('Произошла ошибка при сохранении')
  }

  refreshExportConstructor()
}

function getCatalogIds(payload: CatalogItem[]): number[] {
  const ids: number[] = []

  if (!payload.length) {
    return ids
  }

  payload.forEach((item) => {
    if (item.child) {
      item.child.forEach((c) => {
        if (c.isChecked) {
          ids.push(c.id)
        }
      })
    }
  })

  return ids
}

function getBrandsNames() {
  return exportConstructor.value?.brends ?? []
}

// function getZnaksOptions() {
//   return exportConstructor.value?.znaks
// }
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
            <n-tabs type="line" size="large" animated>
              <n-tab-pane name="catalog" tab="Каталог">
                <XmlFeedCatalog
                  :platform-key="currentPlatform"
                  :selected-category-ids="exportConstructor.catalog"
                />
              </n-tab-pane>
              <n-tab-pane name="brands" tab="Бренды"> Бренды </n-tab-pane>
            </n-tabs>
          </n-card>
        </div>
        <div class="constructor-grid__item">
          <XmlFeedZnaks :state="exportConstructor.znaks" />
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
