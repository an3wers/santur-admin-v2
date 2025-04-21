import { useBannerApi } from '../api/banner-api'
import type { SaveBannerDto } from '../api/banner-schemas'

export const useSaveBanner = () => {
  const status = ref<ProcessStatus>('idle')
  const api = useBannerApi()

  async function save(data: SaveBannerDto) {
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
