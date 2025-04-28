import { usePostApi } from '../api/post-api'

export const useCopyPost = () => {
  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()

  async function makeCopy(id: number) {
    try {
      status.value = 'pending'
      await api.copyPost(id)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { makeCopy, status }
}
