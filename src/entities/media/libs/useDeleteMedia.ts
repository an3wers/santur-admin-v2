import { useMediaApi } from '../api/media.api'

export const useDeleteMedia = () => {
  const status = ref<ProcessStatus>('idle')
  const api = useMediaApi()

  async function deleteFile(id: string) {
    try {
      status.value = 'pending'
      await api.deleteMediaFile(id)
      status.value = 'success'
    } catch (error) {
      console.error(error)

      status.value = 'error'
    }
  }

  return { deleteFile, status }
}
