import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { SearchSubjectRes } from './types'

export const useClientCatalogApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  // api/admin/subjects/Find?search=... - свободный поиск клиентов
  // search - это либо часть наименования, либо код либо инн

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
      key: String(subjId) // `SUBJ:${subjId}`
    }).toString()

    const res = await fetchWithToken<unknown>(`admin/catalog/GetFilterSubj?${query}`)

    const _data = checkError(res).data
    return _data
  }

  return { searchSubject, getFilterSubject }
}
