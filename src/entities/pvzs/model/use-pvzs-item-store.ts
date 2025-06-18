import type { PvzsItem, Pvz } from './pvzs-types'
import { usePvzsApi } from '../api/pvzs-api'
import { getPvzsCategoryKey } from '../api/query-keys'
import { mapPvzsItem } from '../libs/map-pvzs-item'

// TODO: Заменить глобальный стор на composable или на контекст provide/inject
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

  const loadStatus = ref<ProcessStatus>('idle')
  const loadError = ref('')

  // TODO: можно вынести в отдельный модуль
  const saveStatus = ref<ProcessStatus>('idle')
  const saveError = ref('')

  // TODO: можно вынести в отдельный модуль
  const removeStatus = ref<ProcessStatus>('idle')
  const removeError = ref('')

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

  async function loadPvzsItem(id: string | number) {
    try {
      loadStatus.value = 'pending'
      loadError.value = ''

      const res = await api.getPvzsItem(String(id))

      const data = mapPvzsItem(res)

      setPvzsItem(data)
      setPvzsItemSecondaryFileds(data)
      loadStatus.value = 'success'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      loadStatus.value = 'error'
      loadError.value = errorMessage
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

      await api.savePvzsItem(request)
      clearNuxtData(getPvzsCategoryKey(pvzsItemSecondaryFields.ownerid))

      saveStatus.value = 'success'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      saveStatus.value = 'error'
      saveError.value = errorMessage
    }
  }

  async function deletePvzsItem(id: string | number) {
    try {
      removeStatus.value = 'pending'
      removeError.value = ''

      await api.deletePvzsItem(String(id))

      clearNuxtData(getPvzsCategoryKey(pvzsItemSecondaryFields.ownerid))

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

    Object.assign(pvzsItemSecondaryFields, { currentTaEmail: '', currentTaReg: '', ownerid: 0 })

    loadStatus.value = 'idle'
    loadError.value = ''

    saveStatus.value = 'idle'
    saveError.value = ''

    removeStatus.value = 'idle'
    removeError.value = ''
  }

  return {
    pvzsItem,
    pvzsItemSecondaryFields,
    loadStatus,
    loadError,
    saveStatus,
    saveError,
    removeStatus,
    removeError,
    $reset,
    loadPvzsItem,
    savePvzsItem,
    deletePvzsItem
  }
})
