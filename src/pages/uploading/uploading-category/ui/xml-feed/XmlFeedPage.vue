<script setup lang="ts">
import { NCard, NInput, NButton, NIcon, NSelect, NSpace } from 'naive-ui'
import { Copy, ExternalLink } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'
import XmlFeedCatalog from './XmlFeedCatalog.vue'
import { getCatalogQueryKey } from '~/entities/catalog'
import type { CatalogItem } from '../../model/types'
import { useUploadingApi } from '~/entities/uploading'

const link = 'https://isantur.ru/Client/GetCatalogFeed'

const currentPlatform = ref('YAND')
const platformOptions = [{ label: 'Яндекс', value: 'YAND' }]

const api = useUploadingApi()

const { data: exportConstructor, status: exportConstructorStatus } = useAsyncData(() =>
  api.getExportConstructor(currentPlatform.value)
)

const openInNewTabHandler = () => {
  window.open(link, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(link)
}

function updateHandler() {
  const { data } = useNuxtData<CatalogItem[]>(`${getCatalogQueryKey()}-feed`)

  if (!data.value) {
    return
  }

  const catalog = getCatalogIds(data.value)
}

function getCatalogIds(payload: CatalogItem[]): number[] {
  const ids: number[] = []

  // const filtered = payload.filter((item) => item.isChecked)

  if (payload.length) {
    payload.forEach((item) => {
      if (item.child) {
        item.child.forEach((c) => {
          if (c.isChecked) {
            ids.push(c.id)
          }
        })
      }
    })
  }

  return ids
}
</script>

<template>
  <n-space justify="center" v-if="exportConstructorStatus === 'pending'">
    <n-spin size="medium" />
  </n-space>
  <n-space v-else vertical size="large">
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
    <div v-if="exportConstructorStatus === 'success' && exportConstructor">
      <XmlFeedCatalog
        :platform-key="currentPlatform"
        :selected-category-ids="exportConstructor.catalog"
      />
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
</style>
