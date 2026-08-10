import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type {
  FilterSubjectKeyRes,
  FilterSubjectRes,
  GetCatalogRes,
  SaveFilterSubjectReq,
  SearchManagersRes,
  SearchSubjectRes
} from './types'

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

  async function getFilterSubjectsKeys() {
    const res = await fetchWithToken<FilterSubjectKeyRes[]>('admin/catalog/GetFilterSubjKeys')

    const _data = checkError(res).data
    return _data
  }

  async function getFilterSubject(subjId: number) {
    const query = new URLSearchParams({
      key: String(subjId)
    }).toString()

    const res = await fetchWithToken<FilterSubjectRes>(`admin/catalog/GetFilterSubj?${query}`)

    const _data = checkError(res).data
    return _data
  }

  async function getCatalogBySubject(subjId: number) {
    const res = await fetchWithToken<GetCatalogRes[]>(
      `admin/catalog/GetTntksForSubjectFilter?subjectId=${subjId}`
    )

    const _data = checkError(res).data
    return _data
  }

  async function getBrandsByTk(tkId: number) {
    const query = new URLSearchParams({
      tks: String(tkId)
    }).toString()

    const res = await fetchWithToken<{ name: string }[]>(`admin/catalog/GetBrendsByTKs?${query}`)

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

  async function getPriceTypes() {
    const res = await fetchWithToken<
      {
        code: string
        title: string
      }[]
    >('good/GetPriceTypes')

    const _data = checkError(res).data
    return _data
  }

  async function searchManagers(value: string, abortController: AbortController) {
    const query = new URLSearchParams({
      search: value
    }).toString()

    const res = await fetchWithToken<SearchManagersRes[]>(`admin/subjects/FindTA?${query}`, {
      signal: abortController.signal
    })

    const _data = checkError(res).data
    return _data
  }

  async function getSubjectsByManagerEmail(email: string) {
    const query = new URLSearchParams({
      taemail: email
    }).toString()

    const res = await fetchWithToken<SearchSubjectRes[]>(`admin/subjects/GetByTA?${query}`)

    const _data = checkError(res).data
    return _data
  }

  return {
    searchSubject,
    getFilterSubject,
    getBrandsByTk,
    saveFilterSubject,
    getPriceTypes,
    searchManagers,
    getSubjectsByManagerEmail,
    getFilterSubjectsKeys,
    getCatalogBySubject
  }
}
