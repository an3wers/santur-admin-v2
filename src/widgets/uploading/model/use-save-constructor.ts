import type { ExportConstructorDto } from '@/entities/uploading/api/types'
import { useUploadingApi } from '@/entities/uploading/api/uploading-api'

export const useSaveConstructor = (_ctx?: string) => {
  const status = ref<ProcessStatus>('idle')

  const { saveCatalogFilter } = useUploadingApi()
  async function saveConstructor(key: string, data: ExportConstructorDto, makexmlfeed: boolean) {
    try {
      status.value = 'pending'
      await saveCatalogFilter(key, data, makexmlfeed)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { saveConstructor, status }
}
