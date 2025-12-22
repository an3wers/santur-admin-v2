import { usePostApi } from '@/entities/post'

export const useRemovePost = () => {
  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()
  async function removePost(id: number) {
    try {
      status.value = 'pending'
      await api.deletePost(id)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }
  return { removePost, status }
}
