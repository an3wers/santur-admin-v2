import { usePvzsApi } from '../api/pvzs-api'
import { getPvzsCategoryKey } from '../api/query-keys'

export const usePvzs = (ownerId: string) => {
  const { getPvzs } = usePvzsApi()
  return useAsyncData(getPvzsCategoryKey(ownerId), () => getPvzs(ownerId), {
    transform: (data) => {
      return data.map((el) => {
        return {
          id: el.id,
          name: el.name,
          address: el.address,
          times: el.times,
          phones: el.phones,
          isActive: el.isActive,
          gpscoords: el.gpscoords,
          city: el.city
        }
      })
    },

    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  })
}
