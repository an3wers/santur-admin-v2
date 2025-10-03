import type { AsyncDataRequestStatus } from '#app'
import { useClientProjectsApi } from '~/entities/client-projects'

export const useSaveSettings = () => {
  const status = ref<AsyncDataRequestStatus>('idle')

  async function saveSettings(data: { subjectId: number; systema: string; brends: string[] }) {
    try {
      status.value = 'pending'
      await useClientProjectsApi().saveSettings(data)
      status.value = 'success'
    } catch (error) {
      console.log(error)
      status.value = 'error'
    }
  }

  return { status, saveSettings }
}
