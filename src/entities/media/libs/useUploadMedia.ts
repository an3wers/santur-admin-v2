import type { OptionsType } from './types'
import { useMediaApi } from '../api/media.api'

export const useUploadMedia = () => {
  const status = ref<ProcessStatus>('idle')

  const api = useMediaApi()
  async function uploadFile(files: Set<File>) {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      status.value = 'pending'
      await api.uploadMediaFiles(formData)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { uploadFile, status }
}
