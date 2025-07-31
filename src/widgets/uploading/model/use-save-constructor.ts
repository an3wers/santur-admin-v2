import type { ExportConstructorDto } from '@/entities/uploading/api/types'
import { useUploadingApi } from '@/entities/uploading/api/uploading-api'

export const useSaveConstructor = (ctx: string) => {
  const status = ref<ProcessStatus>('idle')

  const { saveExportConstructor, saveCatalogFilter } = useUploadingApi()
  async function saveConstructor(key: string, data: ExportConstructorDto) {
    try {
      status.value = 'pending'
      if (ctx === '1') {
        await saveExportConstructor(key, data)
      } else if (ctx === '2') {
        await saveCatalogFilter(key, data)
      }
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { saveConstructor, status }
}
