import { useBannerApi } from '../api/banner-api'

export const useUpdateOrderBanner = () => {
  const status = ref<ProcessStatus>('idle')

  const api = useBannerApi()

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

  return { updateOrder, status }
}
