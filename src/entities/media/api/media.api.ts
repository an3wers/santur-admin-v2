import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import { mediaListSchema, type MediaFilesRequest } from './media.schema'
import { z } from 'zod'

export const useMediaApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()
  async function getMediaFiles(options: MediaFilesRequest) {
    const query = new URLSearchParams(options as unknown as Record<string, string>)

    const res = await fetchWithToken(`Admin/GetMediaFiles?${query.toString()}`)

    const _data = checkError(res).data

    return mediaListSchema.parse(_data)
  }

  async function uploadMediaFiles(formData: FormData) {
    const res = await fetchWithToken('Admin/MediaFileUpload', {
      method: 'POST',
      body: formData
    })

    const _data = checkError(res).data

    return z.number().parse(_data)
  }

  async function deleteMediaFile(id: string) {
    const query = new URLSearchParams({
      id
    })

    const res = await fetchWithToken(`Admin/DeleteFile?${query.toString()}`)

    const _data = checkError(res).data

    return z.object({}).parse(_data) //z.number().parse(_data)
  }

  async function updateFileName(id: string, name: string) {
    const res = await fetchWithToken('Admin/UpdateName', {
      method: 'POST',
      body: {
        id,
        fileName: name
      }
    })

    const _data = checkError(res).data
    // TODO: add schema
    return _data
  }

  return { getMediaFiles, uploadMediaFiles, deleteMediaFile, updateFileName }
}
