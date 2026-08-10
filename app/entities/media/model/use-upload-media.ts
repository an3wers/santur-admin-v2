import { useMediaApi } from '../api/media-api'

export const useUploadMedia = () => {
  const fileList = new Set<File>()
  const status = ref<ProcessStatus>('idle')

  const api = useMediaApi()

  function setFileToList(file: File) {
    fileList.add(file)
  }

  async function uploadFiles(files: Set<File> | File[]) {
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
    } finally {
      fileList.clear()
    }
  }

  const uploadFilesDebounce = useDebounceFn(() => uploadFiles(fileList), 300)

  return { uploadFiles, status, uploadFilesDebounce, setFileToList }
}
