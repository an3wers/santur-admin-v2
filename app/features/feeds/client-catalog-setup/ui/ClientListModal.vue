<script setup lang="ts">
import { NSpin, NList, NListItem, NText } from 'naive-ui'
import { useClientCatalogApi } from '~/entities/feeds'
import type { SubjectItem } from '../model/types'
import { getCache } from '~/shared/libs/api/get-async-cache'

const { selectedManagerEmail } = defineProps<{
  selectedManagerEmail: string
}>()

const emits = defineEmits<{
  (e: 'onSelectSubject', subject: SubjectItem): void
  (e: 'onClose'): void
}>()

const { getSubjectsByManagerEmail } = useClientCatalogApi()

const { data, status } = await useAsyncData(
  `subjects-by-manager-${selectedManagerEmail}`,
  () => getSubjectsByManagerEmail(selectedManagerEmail),
  {
    getCachedData(key, nuxtApp) {
      return getCache(key, nuxtApp)
    },
    lazy: true
  }
)

function selectHandler(item: SubjectItem) {
  emits('onSelectSubject', item)
  emits('onClose')
}
</script>

<template>
  <div>
    <n-spin size="small" :show="status === 'pending'">
      <div v-if="!data" style="height: 100px"></div>

      <n-list v-if="data && data.length > 0" hoverable clickable>
        <n-list-item v-for="item in data" :key="item.id" @click="selectHandler(item)">
          {{ item.name }}
        </n-list-item>
      </n-list>
      <n-text tag="p" style="text-align: center" v-else-if="data && data.length === 0"
        >Ничего не найдено</n-text
      >
    </n-spin>
  </div>
</template>

<style scoped></style>
