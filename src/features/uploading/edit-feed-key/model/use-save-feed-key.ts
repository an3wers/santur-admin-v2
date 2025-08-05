import { useUploadingApi } from '~/entities/uploading'

export const useSaveFeedKey = () => {
  const status = ref<ProcessStatus>('idle')
  const error = ref<string>('')
  const api = useUploadingApi()
  async function saveFeedKey(payload: { name: string; key: string; descr: string }) {
    try {
      status.value = 'pending'
      error.value = ''
      const { descr, key, name } = payload
      await api.saveCatalogFilterKey(key, {
        key,
        descr,
        title: name
      })
      status.value = 'success'
    } catch (e) {
      console.error(e)
      error.value = e instanceof Error ? e.message : 'Что-то пошло не так'
      status.value = 'error'
    }
  }

  return { saveFeedKey, status, error }
}
