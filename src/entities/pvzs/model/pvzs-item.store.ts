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

  const saveStatus = ref<ProcessStatus>('idle')
  const saveError = ref('')

  const removeStatus = ref<ProcessStatus>('idle')
  const removeError = ref('')

  const itemKey = computed(() => `pvzsItem-${pvzsItem.id}`)
  const listKey = computed(() => `pvzs-${pvzsItemSecondaryFields.ownerid}`)

  function setPvzsItem(item: Pvz) {
    pvzsItem.address = item.address
    pvzsItem.cfo = item.cfo
    pvzsItem.city = item.city
    pvzsItem.code = item.code
    pvzsItem.descr = item.descr
    pvzsItem.forP = item.forP
    pvzsItem.forU = item.forU
    pvzsItem.gpsLat = item.gpsLat
    pvzsItem.gpsLng = item.gpsLng
    pvzsItem.id = item.id
    pvzsItem.isActive = item.isActive
    pvzsItem.name = item.name
    pvzsItem.phones = item.phones
    pvzsItem.times = item.times
    pvzsItem.payvariants = item.payvariants
  }

  function setPvzsItemSecondaryFileds(fields: Pvz) {
    pvzsItemSecondaryFields.currentTaEmail = fields.currentTaEmail
    pvzsItemSecondaryFields.currentTaReg = fields.currentTaReg
    pvzsItemSecondaryFields.ownerid = fields.ownerid
  }

  const api = usePvzsApi()

  async function updateCurrent(id: number) {
    await refreshNuxtData(itemKey.value)

    clearNuxtData(listKey.value)

    const { data } = useNuxtData<Pvz>(itemKey.value)

    if (data.value) {
      setPvzsItem(data.value)
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
      } else {
        request.currentTaReg = new Date().toISOString()
      }

      const savedPvz = await api.savePvzsItem(request)

      saveStatus.value = 'success'

      return savedPvz
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      saveStatus.value = 'error'
      saveError.value = errorMessage
    }
  }

  async function deletePvzsItem(id: number) {
    try {
      removeStatus.value = 'pending'
      removeError.value = ''

      await api.deletePvzsItem(id.toString())
      clearNuxtData(listKey.value)

      removeStatus.value = 'success'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      removeStatus.value = 'error'
      removeError.value = errorMessage
    }
  }

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
    itemKey,
    listKey,
    savePvzsItem,
    deletePvzsItem,
    setPvzsItem,
    setPvzsItemSecondaryFileds,
    updateCurrent
  }
})
