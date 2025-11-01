import { useFeedsApi } from '~/entities/feeds'

export const useRemoveFeed = () => {
  const status = ref<ProcessStatus>('idle')
  const error = ref<string>('')

  const { deleteFeedKey } = useFeedsApi()

  async function removeFeedByKey(key: string) {
    try {
      status.value = 'pending'
      error.value = ''
      await deleteFeedKey(key)
      status.value = 'success'
    } catch (e) {
      console.error(e)
      error.value = e instanceof Error ? e.message : 'Что-то пошло не так'
      status.value = 'error'
    }
  }
  return { removeFeedByKey, status, error }
}
