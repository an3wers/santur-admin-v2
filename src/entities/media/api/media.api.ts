import { useAppRequest } from '~/shared/libs/api/useAppRequests'
import { mediaListSchema, type MediaFilesRequest } from './media.schema'

export const useMediaApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()
  async function getMediaFiles(options: MediaFilesRequest) {
    const query = new URLSearchParams(options as unknown as Record<string, string>)

    const res = await fetchWithToken(`Admin/GetMediaFiles?${query.toString()}`)

    const _data = checkError(res).data

    return mediaListSchema.parse(_data)
  }
  return { getMediaFiles }
}
