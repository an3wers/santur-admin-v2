import { useBannerApi, type Banner } from '@/entities/banner'

export const useSaveBanner = () => {
  const status = ref<ProcessStatus>('idle')
  const api = useBannerApi()

  async function save(data: Banner) {
    try {
      status.value = 'pending'
      await api.saveBanner(data)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }
  return { save, status }
}
