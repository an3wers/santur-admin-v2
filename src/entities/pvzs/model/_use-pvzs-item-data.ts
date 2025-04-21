import { usePvzsApi } from '../api/pvzs-api'
import { getPvzsItemKey } from '../api/query-keys'

// Не используется

export const usePvzsItem = (itemId: string) => {
  const { getPvzsItem } = usePvzsApi()

  return useAsyncData(getPvzsItemKey(itemId), () => getPvzsItem(itemId), {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || null
    }
  })
}
