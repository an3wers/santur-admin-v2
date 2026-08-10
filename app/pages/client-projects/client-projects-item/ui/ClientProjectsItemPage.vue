<script setup lang="ts">
import { NSpace, NH1, useMessage, NSpin, NButton } from 'naive-ui'
import {
  getClientProjectsDetailQueryKey,
  useClientProjectsApi,
  ClientProjectsDetailInfo,
  ClientProjectsDetailState,
  ClientProjectsDetailFiles,
  ClientProjectsDetailComments
} from '~/entities/client-projects'
import { ClientProjectsCommentsPanel, ClientProjectsUpdateState } from '~/features/client-projects'
import { useDeleteProject } from '~/features/client-projects/model/use-delete-project'
// import { projectItemMapper } from '../model/project-item-mapper'

const { itemId } = useRoute().params

if (!itemId || isNaN(Number(itemId))) {
  throw createError({
    statusMessage: 'ID проекта не найден',
    statusCode: 400,
    fatal: true
  })
}

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

function updateShowCommentsPanel(value: boolean) {
  showCommentsPanel.value = value
}

const { deleteProject, status: deleteProjectStatus, error: deleteProjectError } = useDeleteProject()
async function deleteProjectHandler(projectId: number) {
  await deleteProject(projectId)

  if (deleteProjectStatus.value === 'success') {
    message.success('Проект успешно удален')
    return navigateTo('/client-projects')
  } else if (deleteProjectStatus.value === 'error') {
    message.error(deleteProjectError.value?.message || 'Произошла ошибка при удалении проекта')
  }
}
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
        <template #actions>
          <n-button
            secondary
            type="error"
            :loading="deleteProjectStatus === 'pending'"
            @click="deleteProjectHandler(clientProjectData.id)"
          >
            Удалить проект
          </n-button>
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
          <ClientProjectsDetailComments
            :comments-count="clientProjectData.comments.length"
            @show-comments="updateShowCommentsPanel(true)"
          />
        </n-space>
      </div>
    </n-space>
    <ClientProjectsCommentsPanel
      v-if="showCommentsPanel"
      :show="showCommentsPanel"
      :project-id="clientProjectData?.id || 0"
      :comments="clientProjectData?.comments || []"
      @update:show="updateShowCommentsPanel"
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
