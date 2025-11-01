import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { FeedFilterReq, FeedFilterRes, FeedKeyRes } from './types'

export const useFeedsApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function saveFeedFilter(key: string, data: FeedFilterReq, makexmlfeed: boolean) {
    const res = await fetchWithToken<FeedFilterRes>(
      `AdminGoods/SaveCatalogFilter?key=${key}&makexmlfeed=${makexmlfeed}`,
      {
        method: 'POST',
        body: data
      }
    )

    const _data = checkError(res).data
    return _data
  }

  async function getFeedsKeys() {
    const res = await fetchWithToken<FeedKeyRes[]>('AdminGoods/GetCatalogFilterKeys')
    const _data = checkError(res).data
    return _data
  }

  async function getFeedFilter(key: string) {
    const res = await fetchWithToken<FeedFilterRes>(`AdminGoods/GetCatalogFilter?key=${key}`)
    const _data = checkError(res).data
    return _data
  }

  async function saveFeedKey(key: string, payload?: { key: string; title: string; descr: string }) {
    const formData = new FormData()

    if (payload) {
      formData.append('key', payload.key)
      formData.append('title', payload.title)
      formData.append('descr', payload.descr)
    }

    const res = await fetchWithToken('AdminGoods/SaveCatalogFilterKey', {
      method: 'POST',
      body: formData
    })

    const _data = checkError(res).data
    return _data
  }

  async function deleteFeedKey(key: string) {
    const res = await fetchWithToken(`AdminGoods/DeleteCatalogFilterKey?key=${key}`)
    const _data = checkError(res).data
    return _data
  }

  return {
    saveFeedFilter,
    getFeedsKeys,
    getFeedFilter,
    saveFeedKey,
    deleteFeedKey
  }
}
