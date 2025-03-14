import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import { pvzSchema, type SavePvzsItemDto } from './pvzs-schemas'

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
    const r = pvzSchema.array().parse(mapped)
    console.log('r', r)
    return r //pvzSchema.array().parse(mapped)
  }

  async function getPvzsItem(id: string) {
    const query = new URLSearchParams({
      id
    })

    const res = await fetchWithToken(`Org/GetPickupPoint?${query.toString()}`)
    const _data = checkError(res).data
    const { thisObject, ...otherFields } = _data as Record<string, any>
    return pvzSchema.parse(otherFields)
  }

  async function savePvzsItem(data: SavePvzsItemDto) {
    console.log(data)
    const res = await fetchWithToken('Org/SavePickupPoint', {
      method: 'POST',
      body: data
    })

    const _data = checkError(res).data

    //TODO: добавить zod схему
    return _data
  }

  async function deletePvzsItem(id: string) {
    const query = new URLSearchParams({
      id
    })

    const res = await fetchWithToken(`Org/DeletePickupPoint?${query.toString()}`)

    const _data = checkError(res).data

    //TODO: добавить zod схему
    return _data
  }

  return { getPvzs, getPvzsItem, savePvzsItem, deletePvzsItem }
}
