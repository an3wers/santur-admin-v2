import { usePvzsApi } from '../api/pvzs-api'

export const usePvzs = (ownerId: string) => {
  const { getPvzs } = usePvzsApi()
  return useAsyncData(`pvzs-${ownerId}`, () => getPvzs(ownerId), {
    transform: (data) => {
      return data.map((el) => {
        const { id, name, address, times, phones, isActive, gpscoords, city } = el
        return { id, name, address, times, phones, isActive, gpscoords, city }
      })
    },

    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || null
    }
  })
}
