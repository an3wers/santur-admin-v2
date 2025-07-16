import type { ExportConstructorDto } from '../api/types'
import { useUploadingApi } from '../api/uploading-api'

export const useSaveConstructor = () => {
  const status = ref<ProcessStatus>('idle')

  const { SaveExportConstructor } = useUploadingApi()
  async function saveConstructor(key: string, data: ExportConstructorDto) {
    try {
      status.value = 'pending'
      await SaveExportConstructor(key, data)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { saveConstructor, status }
}
