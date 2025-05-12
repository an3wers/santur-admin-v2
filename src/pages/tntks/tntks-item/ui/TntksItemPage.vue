<script setup lang="ts">
import { CatalogItemCard, useCatalogItem } from '@/entities/catalog'
import { useMessage, NSpace, NH1 } from 'naive-ui'

const title = ref('')

const route = useRoute()
const { itemId } = route.params

const { loadCatalogItem, status, catalogItem, isModified } = useCatalogItem()

await loadCatalogItem(String(itemId))

const message = useMessage()

if (status.value === 'error') {
  message.error('Ошибка загрузки категории')
}

if (status.value === 'success') {
  title.value = catalogItem.name
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
      <CatalogItemCard v-model:state="catalogItem" :is-modified="isModified" />
    </n-space>
  </div>
</template>
