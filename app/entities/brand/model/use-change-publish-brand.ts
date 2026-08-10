import { useBrandApi } from '../api/brand-api'

export const useChangePublishBrand = () => {
  const status = ref<ProcessStatus>('idle')
  const api = useBrandApi()
  async function changePublish(brandId: number) {
    try {
      status.value = 'pending'
      const res = await api.changePublish(brandId)
      status.value = 'success'
      return res
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { status, changePublish }
}
