// import { useMessage } from 'naive-ui'
// import { useClientProjectsApi } from '~/entities/client-projects'
// import type { GetSpendBonusRes } from '~/entities/client-projects/api/types'

export const useSpendBonusModal = () => {
  interface CurrentSubject {
    id: number
    name: string
    bonusSum: number
    requestedBonusTospend: number
  }

  const currentSubject = ref<CurrentSubject>({
    id: 0,
    name: '',
    bonusSum: 0,
    requestedBonusTospend: 0
  })

  const isOpenSpendBonus = ref(false)

  function setCurrentSubject(subject: CurrentSubject) {
    currentSubject.value = subject
  }

  function toggleSpendBonus() {
    isOpenSpendBonus.value = !isOpenSpendBonus.value
  }

  function reset() {
    currentSubject.value = {
      id: 0,
      name: '',
      bonusSum: 0,
      requestedBonusTospend: 0
    }

    isOpenSpendBonus.value = false
  }

  watch(isOpenSpendBonus, () => {
    if (!isOpenSpendBonus.value) {
      setTimeout(reset, 200)
    }
  })

  return {
    currentSubject: readonly(currentSubject),
    isOpenSpendBonus: readonly(isOpenSpendBonus),
    setCurrentSubject,
    toggleSpendBonus,
    reset
  }
}
