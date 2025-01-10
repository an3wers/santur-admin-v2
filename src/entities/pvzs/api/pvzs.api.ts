import { useAppRequest } from '~/shared/libs/api/useAppRequests'
import { pvzSchema } from './pvzs.schemas'

export const usePvzsApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()

  async function getPvzs(ownerId: string) {
    const query = new URLSearchParams({
      ownerId
    })

    const res = await fetchWithToken(`Org/GetPickupPoints?${query.toString()}`)
    const _data = checkError(res).data as any[]
    const mapped = _data.map((el) => {
      const { thisObject, ...otherFields } = el
      return otherFields
    })
    return pvzSchema.array().parse(mapped)
  }

  return { getPvzs }
}
