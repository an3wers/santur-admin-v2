import { useUploadingApi } from '~/entities/uploading'

export const useSaveConstructorKey = () => {
  const status = ref<ProcessStatus>('idle')
  const error = ref<string>('')
  const api = useUploadingApi()
  async function saveConstructorKey(key: string) {
    try {
      status.value = 'pending'
      error.value = ''
      await api.saveCatalogFilterKey(key)
      status.value = 'success'
    } catch (e) {
      console.error(e)
      error.value = e instanceof Error ? e.message : 'Что-то пошло не так'
      status.value = 'error'
    }
  }

  return { saveConstructorKey, status, error }
}
