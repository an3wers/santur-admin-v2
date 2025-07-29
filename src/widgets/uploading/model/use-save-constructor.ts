import type { ExportConstructorDto } from '@/entities/uploading/api/types'
import { useUploadingApi } from '@/entities/uploading/api/uploading-api'

export const useSaveConstructor = () => {
  const status = ref<ProcessStatus>('idle')

  const { saveExportConstructor } = useUploadingApi()
  async function saveConstructor(key: string, data: ExportConstructorDto) {
    try {
      status.value = 'pending'
      await saveExportConstructor(key, data)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { saveConstructor, status }
}
