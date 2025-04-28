import { usePostApi } from '../api/post-api'

export const useUpdateOrderPost = () => {
  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()
  async function updateOrder(id: number, order: number) {
    try {
      status.value = 'pending'
      await api.updateOrder(id, order)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { status, updateOrder }
}
