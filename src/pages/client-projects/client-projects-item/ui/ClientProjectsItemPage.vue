<script setup lang="ts">
import { NSpace, NH1, useMessage, NSpin } from 'naive-ui'
import {
  getClientProjectsDetailQueryKey,
  useClientProjectsApi,
  ClientProjectsDetailInfo,
  ClientProjectsDetailState,
  ClientProjectsDetailFiles,
  ClientProjectsDetailComments
} from '~/entities/client-projects'
import { ClientProjectsCommentsPanel, ClientProjectsUpdateState } from '~/features/client-projects'
// import { projectItemMapper } from '../model/project-item-mapper'

const { itemId } = useRoute().params

if (!itemId || isNaN(Number(itemId))) {
  throw createError({
    statusMessage: 'ID проекта не найден',
    statusCode: 400,
    fatal: true
  })
}

const commentValue = ref('')
const showCommentsPanel = ref(false)

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
      <div class="layout">
        <client-projects-detail-info :projects="clientProjectData" />
        <n-space vertical>
          <ClientProjectsDetailState>
            <template #action>
              <ClientProjectsUpdateState
                :project-id="clientProjectData.id"
                :status="clientProjectData.status"
                :cost="clientProjectData.cost"
                :bonus="clientProjectData.bonus"
              />
            </template>
          </ClientProjectsDetailState>
          <ClientProjectsDetailFiles :files="clientProjectData.files" />
          <ClientProjectsDetailComments @show-comments="showCommentsPanel = true" />
        </n-space>
      </div>
    </n-space>
    <ClientProjectsCommentsPanel
      v-if="clientProjectData"
      v-model:show="showCommentsPanel"
      :project-id="clientProjectData.id"
      @update:show="() => {}"
    />
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr minmax(240px, 320px);
  gap: 1rem;
}
</style>
