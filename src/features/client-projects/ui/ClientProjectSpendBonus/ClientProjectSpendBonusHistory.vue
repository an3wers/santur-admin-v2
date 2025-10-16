<script setup lang="ts">
import { NSpin, NList, NListItem, NText, NSpace, NTag } from 'naive-ui'
import { useClientProjectsApi } from '~/entities/client-projects'
import { getCacheWithTTL } from '~/shared/libs/api/get-async-cache'

const { subjectId } = defineProps<{
  subjectId: number
}>()

const { getHistorySpendBonus } = useClientProjectsApi()

const { data: spendHistoryBonusData, status: spendHistoryBonusStatus } = useAsyncData(
  `spend-history-bonus-${subjectId}`,
  () => getHistorySpendBonus(subjectId),
  {
    lazy: true,
    transform(data) {
      return {
        data: data.toSorted((a, b) => b.docId - a.docId),
        fetchedAt: new Date()
      }
    },
    getCachedData: (key, nuxtApp) => getCacheWithTTL(key, nuxtApp, 5)
  }
)

function getStatusColor(stateCode: string) {
  if (stateCode === 'D') {
    return 'error'
  } else if (stateCode === 'F') {
    return 'success'
  } else {
    return 'default'
  }
}
</script>

<template>
  <n-spin :show="spendHistoryBonusStatus === 'pending'">
    <n-list
      style="min-height: 100px"
      hoverable
      bordered
      :theme-overrides="{ borderColorModal: '#d9d9d9' }"
    >
      <n-list-item v-for="request in spendHistoryBonusData?.data" :key="request.docId">
        <n-space align="center">
          <n-text :depth="3">{{ request.regdate }}</n-text>
          <n-tag size="small" :type="getStatusColor(request.stateCode)" :bordered="false">
            {{ request.state }}
          </n-tag>
        </n-space>
        <n-space justify="space-between" align="center" style="margin-top: 2rem">
          <n-text tag="p" strong style="font-size: 1rem">{{ request.requestBonus }}</n-text>
        </n-space>
      </n-list-item>
    </n-list>
  </n-spin>
</template>

<style scoped></style>
