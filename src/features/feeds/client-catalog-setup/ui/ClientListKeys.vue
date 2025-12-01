<script setup lang="ts">
import { useClientCatalogApi } from '~/entities/feeds'
import { NSpin, NCard, NTable, NButton } from 'naive-ui'
import type { FilterSubjectKeyItem, SubjectItem } from '../model/types'
import { getCacheWithTTL } from '~/shared/libs/api/get-async-cache'

const emits = defineEmits<{
  (e: 'onSelectSubject', subject: SubjectItem): void
}>()

const { getFilterSubjectsKeys } = useClientCatalogApi()

const { data, status } = useAsyncData(
  'client-catalog-filter-subjects-keys',
  () => getFilterSubjectsKeys(),
  {
    transform: (data) => {
      return { data, fetchedAt: new Date() }
    },
    getCachedData(key, nuxtApp) {
      return getCacheWithTTL(key, nuxtApp)
    },
    lazy: true
  }
)

function selectHandler(item: FilterSubjectKeyItem) {
  emits('onSelectSubject', {
    id: item.key,
    name: item.title,
    code: '',
    inn: '',
    taemail: ''
  })
}
</script>

<template>
  <n-card title="Сохраненные настройки клиентов">
    <n-spin size="small" :show="status === 'pending'">
      <div v-if="!data" style="height: 100px"></div>

      <div v-else>
        <n-table :bordered="false" :single-line="false" size="medium">
          <thead>
            <tr>
              <th width="120">Id</th>
              <th>Клиент</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.data" :key="item.key">
              <td>{{ item.key }}</td>
              <td>
                <n-button text @click="selectHandler(item)">{{ item.title }}</n-button>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </n-spin>
  </n-card>
</template>
