import { useBannerApi } from '../api/banner-api'

export const useCopyBanner = () => {
  const status = ref<ProcessStatus>('idle')

  const api = useBannerApi()
  async function makeCopy(id: number) {
    try {
      status.value = 'pending'
      await api.copyBanner(id)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { makeCopy, status }
}
