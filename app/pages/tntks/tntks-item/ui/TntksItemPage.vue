<script setup lang="ts">
import { CatalogItemCard, useCatalogItem } from '@/entities/catalog'
import { useMessage, NSpace, NH1, NSpin } from 'naive-ui'

const title = ref('')

const route = useRoute()
const { itemId } = route.params

const { loadCatalogItem, status, catalogItem, isModified, createAlias } = useCatalogItem()

await loadCatalogItem(String(itemId))

const message = useMessage()

if (status.value === 'error') {
  message.error('Ошибка загрузки категории')
}

if (status.value === 'success') {
  title.value = catalogItem.name
}

function refreshCatalogItem() {
  loadCatalogItem(String(itemId))
}
</script>
<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Товарные категории" has-back :back-path="`/tntks`">
        <template #title>
          <n-h1> {{ title }} </n-h1>
        </template>
      </page-title>
      <n-spin :show="status === 'pending'">
        <CatalogItemCard
          v-model:state="catalogItem"
          :is-modified="isModified"
          @on-create-alias="createAlias"
          @on-after-save="refreshCatalogItem"
        />
      </n-spin>
    </n-space>
  </div>
</template>
