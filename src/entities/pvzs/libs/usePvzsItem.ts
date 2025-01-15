import { usePvzsApi } from '../api/pvzs.api'

export const usePvzsItem = (itemId: string) => {
  const { getPvzsItem } = usePvzsApi()

  return useAsyncData(`pvzsItem-${itemId}`, () => getPvzsItem(itemId), {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || null
    }
  })
}
