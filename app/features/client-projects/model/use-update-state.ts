import { useClientProjectsApi } from '~/entities/client-projects'

interface InitialState {
  projectId: number
  status: string
  cost: number
  bonus: number
}
export function useUpdateState({ projectId, status, cost, bonus }: InitialState) {
  const currentState = reactive({
    status,
    cost,
    bonus
  })

  const statusValue = ref(status)
  const costValue = ref(cost)
  const bonusValue = ref(bonus)

  const stateIsChanged = computed(() => {
    return (
      statusValue.value !== currentState.status ||
      costValue.value !== currentState.cost ||
      bonusValue.value !== currentState.bonus
    )
  })

  const updateStatus = ref<ProcessStatus>('idle')
  const updateErrors = ref<string[]>([])

  const { updateProjectState: updateProjectStateRequest } = useClientProjectsApi()
  async function updateProjectState() {
    try {
      // const fns = []

      // if (statusValue.value !== status) fns.push(updateProjectStatus(projectId, statusValue.value))
      // if (costValue.value !== cost) fns.push(updateSum(projectId, costValue.value))
      // if (bonusValue.value !== bonus) fns.push(updatePoints(projectId, bonusValue.value))

      // updateStatus.value = 'pending'
      // updateErrors.value = []

      // const responses = await Promise.allSettled(fns.map((fn) => fn))

      // responses.forEach((res) => {
      //   if (res.status === 'rejected') {
      //     if (res.reason instanceof Error) {
      //       updateErrors.value = [...updateErrors.value, res.reason.message]
      //     } else {
      //       updateErrors.value = [...updateErrors.value, 'Что-то пошло не так']
      //     }
      //     updateStatus.value = 'error'
      //     console.log('rejected', res.reason, res.status)
      //   } else if (res.status === 'fulfilled') {
      //     console.log('fulfilled', res.value, res.status)
      //   }
      // })

      // if (!updateErrors.value.length) {
      //   currentState.status = statusValue.value
      //   currentState.cost = costValue.value
      //   currentState.bonus = bonusValue.value
      //   updateStatus.value = 'success'
      // }

      updateStatus.value = 'pending'
      updateErrors.value = []

      await updateProjectStateRequest({
        id: projectId,
        status: statusValue.value,
        cost: costValue.value,
        bonus: bonusValue.value
      })

      currentState.status = statusValue.value
      currentState.cost = costValue.value
      currentState.bonus = bonusValue.value

      updateStatus.value = 'success'
    } catch (error) {
      console.error(error)
      updateErrors.value = error instanceof Error ? [error.message] : ['Что-то пошло не так']
      updateStatus.value = 'error'
    }
  }

  return {
    updateProjectState,
    statusValue,
    costValue,
    bonusValue,
    updateStatus,
    updateErrors,
    stateIsChanged
  }
}
