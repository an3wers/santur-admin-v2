<script setup lang="ts">
import { useClientCatalogApi } from '~/entities/feeds'
import { NSpin, NCard, NTable, NButton, NText } from 'naive-ui'
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

function selectHandler(subj: FilterSubjectKeyItem['subject']) {
  emits('onSelectSubject', {
    id: subj.id,
    name: subj.name,
    code: subj.code,
    inn: subj.inn,
    taemail: subj.taemail
  })
}
</script>

<template>
  <n-card title="Сохраненные настройки клиентов">
    <n-spin size="small" :show="status === 'pending'">
      <div v-if="!data" style="height: 100px"></div>

      <div v-else>
        <n-table :bordered="false" :single-line="false" size="small">
          <thead>
            <tr>
              <th width="120">Id</th>
              <th>Клиент</th>
              <th width="260">ТА</th>
              <th>Начало</th>
              <th>Конец</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.data" :key="item.key">
              <td>{{ item.key }}</td>
              <td>
                <n-button text @click="selectHandler(item.subject)">{{
                  item.subject.name
                }}</n-button>
                <n-text tag="p" :depth="3">{{ item.subject.inn }}</n-text>
              </td>
              <td>
                {{ item.subject.ta }}
                <n-text tag="p" :depth="3">{{ item.subject.taemail }}</n-text>
              </td>
              <td>{{ item.startDate }}</td>
              <td>{{ item.finishDate }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </n-spin>
  </n-card>
</template>
