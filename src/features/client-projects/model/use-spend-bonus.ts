import { useClientProjectsApi } from '~/entities/client-projects'

export const useSpendBonus = () => {
  const currentSubject = ref<{ id: number; name: string }>({
    id: 0,
    name: ''
  })

  const isOpenSpendBonus = ref(false)

  const spendBonusRequestStatus = ref<ProcessStatus>('idle')
  const spendBonusError = ref<Error | null>(null)

  const spendBonusData = ref<unknown | null>(null)
  const getSpendBonusStatus = ref<ProcessStatus>('idle')
  const getSpendBonusError = ref<Error | null>(null)

  function setCurrentSubject(subject: { id: number; name: string }) {
    currentSubject.value = subject
  }

  function toggleSpendBonus() {
    isOpenSpendBonus.value = !isOpenSpendBonus.value
  }
  const { getSpendBonus: getSpendBonusApi } = useClientProjectsApi()

  async function getSpendBonus() {
    try {
      getSpendBonusStatus.value = 'pending'
      getSpendBonusError.value = null

      const res = await getSpendBonusApi(currentSubject.value.id)
      spendBonusData.value = res

      getSpendBonusStatus.value = 'success'
    } catch (error) {
      getSpendBonusStatus.value = 'error'
      getSpendBonusError.value = error as Error
    }
  }

  function reset() {
    currentSubject.value = {
      id: 0,
      name: ''
    }
    isOpenSpendBonus.value = false
    spendBonusRequestStatus.value = 'idle'
    spendBonusError.value = null
    spendBonusData.value = null
    getSpendBonusStatus.value = 'idle'
    getSpendBonusError.value = null
  }

  watch(isOpenSpendBonus, () => {
    if (!isOpenSpendBonus.value) {
      reset()
    }
  })

  return {
    currentSubject: readonly(currentSubject),
    isOpenSpendBonus: readonly(isOpenSpendBonus),
    spendBonusRequestStatus: readonly(spendBonusRequestStatus),
    spendBonusError: readonly(spendBonusError),
    getSpendBonusStatus: readonly(getSpendBonusStatus),
    getSpendBonusError: readonly(getSpendBonusError),
    spendBonusData: readonly(spendBonusData),
    getSpendBonus,
    setCurrentSubject,
    toggleSpendBonus,
    reset
  }
}
