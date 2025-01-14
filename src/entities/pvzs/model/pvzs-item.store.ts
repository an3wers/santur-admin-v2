import type { PvzsItem, Pvz } from './pvzs.types'
import { usePvzsApi } from '../api/pvzs.api'

export const usePvzsItemStore = defineStore('pvzs-item', () => {
  const pvzsItem = reactive<PvzsItem>({
    address: '',
    cfo: '',
    city: '',
    code: '',
    descr: '',
    forP: false,
    forU: false,
    gpsLat: '',
    gpsLng: '',
    id: 0,
    isActive: false,
    name: '',
    phones: '',
    times: '',
    payvariants: ''
  })

  type SecondaryFields = Pick<Pvz, 'currentTaEmail' | 'currentTaReg' | 'ownerid'>

  const pvzsItemSecondaryFields = reactive<SecondaryFields>({
    currentTaEmail: '',
    currentTaReg: '',
    ownerid: 0
  })

  const pvzsItemStatus = ref<ProcessStatus>('idle')
  const pvzsItemError = ref('')

  const saveStatus = ref<ProcessStatus>('idle')
  const saveError = ref('')

  const removeStatus = ref<ProcessStatus>('idle')
  const removeError = ref('')

  function setPvzsItem(item: PvzsItem) {
    Object.assign(pvzsItem, item)
  }

  function setPvzsItemSecondaryFileds(fields: SecondaryFields) {
    Object.assign(pvzsItemSecondaryFields, fields)
  }

  const api = usePvzsApi()

  async function getPvzsItem(id: string) {
    try {
      pvzsItemStatus.value = 'pending'
      pvzsItemError.value = ''
      const data = await api.getPvzsItem(id)
      setPvzsItem({
        address: data.address,
        cfo: data.cfo,
        city: data.city,
        code: data.code,
        descr: data.descr,
        forP: data.forP,
        forU: data.forU,
        gpsLat: data.gpsLat,
        gpsLng: data.gpsLng,
        id: data.id,
        isActive: data.isActive,
        name: data.name,
        phones: data.phones,
        times: data.times,
        payvariants: data.payvariants
      })

      setPvzsItemSecondaryFileds({
        currentTaEmail: data.currentTaEmail,
        currentTaReg: data.currentTaReg,
        ownerid: data.ownerid
      })

      pvzsItemStatus.value = 'success'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      pvzsItemStatus.value = 'error'
      pvzsItemError.value = errorMessage
    }
  }

  async function savePvzsItem() {
    try {
      saveStatus.value = 'pending'
      saveError.value = ''

      const { id, ...data } = pvzsItem

      const request: Omit<PvzsItem, 'id'> & SecondaryFields & { id?: number } = {
        ...data,
        ...pvzsItemSecondaryFields
      }

      if (id) {
        request.id = id
      }

      await api.savePvzsItem(request)

      saveStatus.value = 'success'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      saveStatus.value = 'error'
      saveError.value = errorMessage
    }
  }

  async function deletePvzsItem(id: number) {}

  function $reset() {
    Object.assign(pvzsItem, {
      address: '',
      cfo: '',
      city: '',
      code: '',
      descr: '',
      forP: false,
      forU: false,
      gpsLat: '',
      gpsLng: '',
      id: 0,
      isActive: false,
      name: '',
      phones: '',
      times: '',
      payvariants: ''
    })

    Object.assign(pvzsItemSecondaryFields, {
      currentTaEmail: '',
      currentTaReg: '',
      ownerid: 0
    })

    pvzsItemStatus.value = 'idle'
    pvzsItemError.value = ''

    saveStatus.value = 'idle'
    saveError.value = ''

    removeStatus.value = 'idle'
    removeError.value = ''
  }

  return {
    pvzsItem,
    pvzsItemSecondaryFields,
    $reset,
    saveStatus,
    saveError,
    removeStatus,
    removeError,
    getPvzsItem,
    savePvzsItem,
    deletePvzsItem,
    pvzsItemStatus,
    pvzsItemError
  }
})
