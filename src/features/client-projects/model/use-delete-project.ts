import type { AsyncDataRequestStatus } from '#app'
import { useClientProjectsApi } from '~/entities/client-projects'

export const useDeleteProject = () => {
  const { deleteProject: deleteProjectApi } = useClientProjectsApi()

  const status = ref<AsyncDataRequestStatus>('idle')
  const error = shallowRef<Error | null>(null)

  async function deleteProject(projectId: number) {
    try {
      status.value = 'pending'
      await deleteProjectApi(projectId)
      status.value = 'success'
    } catch (err) {
      status.value = 'error'

      error.value = err instanceof Error ? err : new Error('Произошла ошибка')
    }
  }

  return { deleteProject, status, error }
}
