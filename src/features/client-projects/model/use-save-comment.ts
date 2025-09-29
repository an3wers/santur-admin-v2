import type { AsyncDataRequestStatus } from '#app'
import { getClientProjectsDetailQueryKey, useClientProjectsApi } from '~/entities/client-projects'

export const useSaveComment = (projectId: number) => {
  const { saveComment: saveCommentApi } = useClientProjectsApi()

  const saveCommentId = ref(0)
  const editingCommentValue = ref('')
  const commentValue = ref('')

  const status = ref<AsyncDataRequestStatus>('idle')
  const error = ref<Error | null>(null)

  async function saveComment() {
    try {
      status.value = 'pending'
      error.value = null

      await saveCommentApi({
        id: saveCommentId.value,
        comment: commentValue.value,
        entity: 'ClienProject',
        entityId: String(projectId),
        isprivate: false
      })

      status.value = 'success'

      reset()

      await refreshNuxtData(getClientProjectsDetailQueryKey(projectId))
    } catch (err) {
      console.log(err)

      status.value = 'error'

      if (err instanceof Error) {
        error.value = err
      }
    }
  }

  function editComment(commentId: number, comment: string) {
    saveCommentId.value = commentId
    commentValue.value = comment
    editingCommentValue.value = comment
  }

  function cancelEdit() {
    reset()
  }

  function reset() {
    saveCommentId.value = 0
    commentValue.value = ''
    editingCommentValue.value = ''
  }

  return {
    commentValue,
    status,
    error,
    saveCommentId,
    editingCommentValue,
    saveComment,
    editComment,
    cancelEdit
  }
}
