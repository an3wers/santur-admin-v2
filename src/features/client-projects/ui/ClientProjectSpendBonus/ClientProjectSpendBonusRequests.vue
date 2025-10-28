<script setup lang="ts">
import { useMessage, NList, NListItem, NText, NButton, NSpace, NSpin, NTag } from 'naive-ui'
import { useClientProjectsApi } from '~/entities/client-projects'
import { getCacheWithTTL } from '~/shared/libs/api/get-async-cache'

const { subjectId } = defineProps<{
  subjectId: number
}>()

const { getSpendBonus, approveToSpendBonus, cancelToSpendBonus } = useClientProjectsApi()

const {
  data: spendBonusData,
  status: spendBonusStatus,
  refresh: spendBonusRefresh
} = useAsyncData(`spend-bonus-${subjectId}`, () => getSpendBonus(subjectId), {
  lazy: true,
  transform(data) {
    return {
      data: data.toSorted((a, b) => b.docId - a.docId),
      fetchedAt: new Date()
    }
  },
  getCachedData: (key, nuxtApp) => getCacheWithTTL(key, nuxtApp, 5)
})

const { approveRequest, status: approveStatus } = useApproveSpendBonus()
const { cancelRequest, status: cancelStatus } = useCancelSpendBonus()

const isLoading = computed(() => {
  return (
    spendBonusStatus.value === 'pending' ||
    approveStatus.value === 'pending' ||
    cancelStatus.value === 'pending'
  )
})

const message = useMessage()

function useApproveSpendBonus() {
  const status = ref<ProcessStatus>('idle')
  const error = ref<string>('')

  async function approveRequest(docId: number) {
    try {
      status.value = 'pending'
      error.value = ''
      await approveToSpendBonus(docId)
      status.value = 'success'
      message.success('Запрос успешно подтвержден')
      spendBonusRefresh()
      clearNuxtData(`spend-history-bonus-${subjectId}`)
    } catch (err) {
      console.error(error)
      status.value = 'error'
      error.value = err instanceof Error ? err.message : 'Произошла ошибка'
      message.error(error.value)
    }
  }

  return { status, approveRequest, error }
}

function useCancelSpendBonus() {
  const status = ref<ProcessStatus>('idle')
  const error = ref<string>('')

  async function cancelRequest(docId: number) {
    try {
      status.value = 'pending'
      error.value = ''
      await cancelToSpendBonus(docId)
      status.value = 'success'
      message.success('Запрос успешно отменен')
      spendBonusRefresh()
      clearNuxtData(`spend-history-bonus-${subjectId}`)
    } catch (err) {
      console.error(error)
      status.value = 'error'
      error.value = err instanceof Error ? err.message : 'Произошла ошибка'
      message.error(error.value)
    }
  }

  return { status, cancelRequest, error }
}
</script>

<template>
  <n-spin :show="isLoading">
    <n-list
      style="min-height: 100px"
      hoverable
      bordered
      :theme-overrides="{ borderColorModal: '#d9d9d9' }"
    >
      <div style="margin: 2rem 0; text-align: center" v-if="spendBonusData?.data.length === 0">
        <n-text :depth="3">Запросы на списание баллов отсутствуют</n-text>
      </div>

      <n-list-item v-for="request in spendBonusData?.data" :key="request.docId">
        <n-space align="center">
          <n-text :depth="3">{{ request.regdate }}</n-text>
          <n-tag size="small" :bordered="false">
            {{ request.state }}
          </n-tag>
        </n-space>
        <n-space justify="space-between" align="center" style="margin-top: 2rem">
          <n-text tag="p" strong style="font-size: 1rem">{{ request.requestBonus }}</n-text>
          <n-space horizontal>
            <template v-if="request.stateCode === 'N'">
              <n-button type="error" secondary size="tiny" @click="cancelRequest(request.docId)"
                >Отменить</n-button
              >
              <n-button type="primary" size="tiny" @click="approveRequest(request.docId)"
                >Подтвердить</n-button
              >
            </template>
          </n-space>
        </n-space>
      </n-list-item>
    </n-list>
  </n-spin>
</template>

<style scoped></style>
