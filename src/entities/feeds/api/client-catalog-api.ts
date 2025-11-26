import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { FilterSubjectRes, SaveFilterSubjectReq, SearchSubjectRes } from './types'

export const useClientCatalogApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function searchSubject(value: string, abortController: AbortController) {
    const query = new URLSearchParams({
      search: value
    }).toString()

    const res = await fetchWithToken<SearchSubjectRes[]>(`admin/subjects/Find?${query}`, {
      signal: abortController.signal
    })

    const _data = checkError(res).data
    return _data
  }

  // async function getFilterSubjectKeys() {
  //   const res = await fetchWithToken<string[]>('admin/catalog/GetFilterSubjKeys')

  //   const _data = checkError(res).data
  //   return _data
  // }

  async function getFilterSubject(subjId: number) {
    const query = new URLSearchParams({
      key: String(subjId)
    }).toString()

    const res = await fetchWithToken<FilterSubjectRes>(`admin/catalog/GetFilterSubj?${query}`)

    const _data = checkError(res).data
    return _data
  }

  async function getBrandsByTk(tkId: number) {
    const query = new URLSearchParams({
      tks: String(tkId)
    }).toString()

    const res = await fetchWithToken<unknown>(`admin/catalog/GetBrendsByTKs?${query}`)

    const _data = checkError(res).data
    return _data
  }

  async function saveFilterSubject(data: SaveFilterSubjectReq) {
    const res = await fetchWithToken<unknown>('admin/catalog/SaveFilterSubj', {
      method: 'POST',
      body: data
    })

    const _data = checkError(res).data
    return _data
  }

  return { searchSubject, getFilterSubject, getBrandsByTk, saveFilterSubject }
}
