<script setup lang="ts">
import { NSpace, NH1, useMessage, NSpin } from 'naive-ui'
import {
  getClientProjectsDetailQueryKey,
  useClientProjectsApi,
  ClientProjectsDetailInfo
} from '~/entities/client-projects'

const { itemId } = useRoute().params

if (!itemId || isNaN(Number(itemId))) {
  throw createError({
    statusMessage: 'ID проекта не найден',
    statusCode: 400,
    fatal: true
  })
}

const { getClientProjectsById } = useClientProjectsApi()

const { data: clientProjectData, status: clientProjectStatus } = useAsyncData(
  getClientProjectsDetailQueryKey(Number(itemId)),
  () => getClientProjectsById(Number(itemId)),
  {
    lazy: true
  }
)

const message = useMessage()

watch(clientProjectStatus, () => {
  if (clientProjectStatus.value === 'error') {
    message.error('Произошла ошибка при загрузке проекта')
  }
})
</script>

<template>
  <div class="container">
    <n-spin
      v-if="clientProjectStatus === 'pending' && !clientProjectData"
      :show="clientProjectStatus === 'pending'"
    >
      <div style="height: 200px"></div>
    </n-spin>

    <n-space v-else-if="clientProjectData" vertical size="large">
      <page-title back-label="Проекты" has-back :back-path="`/client-projects`">
        <template #title>
          <n-h1>{{ clientProjectData.projectName }}</n-h1>
        </template>
      </page-title>
      <client-projects-detail-info :projects="clientProjectData" />
    </n-space>
  </div>
</template>
