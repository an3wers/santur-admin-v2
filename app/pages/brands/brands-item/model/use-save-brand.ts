import { useBrandApi } from '@/entities/brand'
import type { BrandSaveDto, BrandSaveFilesDto } from '~/entities/brand/api/brand-schemas'

export const useSaveBrand = () => {
  const status = ref<ProcessStatus>('idle')

  const api = useBrandApi()
  async function saveBrand(data: BrandSaveDto, files: BrandSaveFilesDto[]) {
    try {
      status.value = 'pending'
      await api.saveBrand(data, files)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { saveBrand, status }
}
