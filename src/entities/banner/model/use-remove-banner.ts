import { useBannerApi } from '../api/banner-api'

export const useRemoveBanner = () => {
  const status = ref<ProcessStatus>('idle')

  const api = useBannerApi()

  async function remove(id: number) {
    try {
      status.value = 'pending'
      await api.deleteBanner(id)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { remove, status }
}
