import type { AsyncDataRequestStatus } from '#app'
import {
  getClientProjectsDetailQueryKey,
  useClientProjectsApi,
  type ClientProjectDetailDto
} from '~/entities/client-projects'

export const useDeleteComment = (projectId: number) => {
  const status = ref<AsyncDataRequestStatus>('idle')
  const error = ref<Error | null>(null)

  let prevState: ClientProjectDetailDto['comments'] = []

  const { data: currentProject } = useNuxtData<ClientProjectDetailDto>(
    getClientProjectsDetailQueryKey(projectId)
  )
  const { removeComment } = useClientProjectsApi()
  async function deleteComment(commentId: number) {
    try {
      status.value = 'pending'
      error.value = null

      // optimistic update
      if (currentProject.value) {
        prevState = currentProject.value.comments

        currentProject.value.comments = currentProject.value.comments.filter(
          (comment) => comment.id !== commentId
        )
      }

      await removeComment(commentId)

      refreshNuxtData(getClientProjectsDetailQueryKey(projectId))

      status.value = 'success'
    } catch (err) {
      console.error(err)
      status.value = 'error'

      // rollback
      if (currentProject.value) {
        currentProject.value.comments = prevState
      }

      if (err instanceof Error) {
        error.value = err
      }
    }
  }

  return {
    deleteComment
  }
}
