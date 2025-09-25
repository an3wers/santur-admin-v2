import type { AsyncDataRequestStatus } from '#app'
import { getClientProjectsDetailQueryKey, useClientProjectsApi } from '~/entities/client-projects'

export const useAddComment = (projectId: number) => {
  const { addComment: addCommentApi } = useClientProjectsApi()

  const commentValue = ref('')
  const status = ref<AsyncDataRequestStatus>('idle')
  const error = ref<Error | null>(null)

  // Если передан id, то обновить комментарий
  async function addComment(id: number) {
    try {
      status.value = 'pending'
      error.value = null
      await addCommentApi({
        id: id,
        comment: commentValue.value,
        entity: 'ClienProject',
        entityId: String(projectId),
        isprivate: false
      })

      status.value = 'success'

      commentValue.value = ''

      await refreshNuxtData(getClientProjectsDetailQueryKey(projectId))
    } catch (err) {
      console.log(err)

      status.value = 'error'

      if (err instanceof Error) {
        error.value = err
      }
    }
  }

  return { addComment, commentValue, status, error }
}
