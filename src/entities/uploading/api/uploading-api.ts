import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { ExportConstructorDto } from './types'

export const useUploadingApi = () => {
  const { baseFetch, checkError } = useAppRequest()

  async function getExportConstructor(key: string) {
    const res = await baseFetch<ExportConstructorDto>('/apiTmp/GetExportConstructor?key=' + key)
    const _data = checkError(res).data
    return _data
  }

  async function SaveExportConstructor(key: string, data: ExportConstructorDto) {
    const res = await baseFetch<ExportConstructorDto>('/apiTmp/SaveExportConstructor?key=' + key, {
      method: 'POST',
      body: data
    })
    const _data = checkError(res).data
    return _data
  }

  return { getExportConstructor, SaveExportConstructor }
}
