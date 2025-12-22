import { useBannerApi, type SaveBannerReq } from '@/entities/banner'

export const useSaveBanner = () => {
  const status = ref<ProcessStatus>('idle')
  const api = useBannerApi()

  async function save(data: SaveBannerReq) {
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
