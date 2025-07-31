import { useUploadingApi } from '~/entities/uploading'

export const useRemoveFeed = () => {
  const status = ref<ProcessStatus>('idle')
  const error = ref<string>('')
  const api = useUploadingApi()

  async function removeFeedByKey(key: string) {
    try {
      status.value = 'pending'
      error.value = ''
      await api.deleteCatalogFilterKey(key)
      status.value = 'success'
    } catch (e) {
      console.error(e)
      error.value = e instanceof Error ? e.message : 'Что-то пошло не так'
      status.value = 'error'
    }
  }
  return { removeFeedByKey, status, error }
}
