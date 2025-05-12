<script setup lang="ts">
import { NH1, NSpace, NP, NButton, NModal, useMessage } from 'naive-ui'
import {
  CatalogList,
  getCatalogQueryKey,
  useCatalogApi,
  groupCatalogItems,
  UploadCatalogItemData
} from '~/entities/catalog'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()

const api = useCatalogApi()
const { data, status } = await useAsyncData(getCatalogQueryKey(), api.getCatalog)

const message = useMessage()

if (status.value === 'error') {
  // TODO: Обработать ошибку
  message.error('На странице произошла ошибка')
}

const groupedCatalogItems = computed(() => {
  if (!data.value) {
    return []
  }
  return groupCatalogItems(data.value)
})

const showUploadFileModal = ref(false)
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
      <CatalogList :items="groupedCatalogItems" />
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
  </div>
</template>
