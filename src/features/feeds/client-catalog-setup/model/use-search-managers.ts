import type { AsyncDataRequestStatus } from '#app'
import { useClientCatalogApi } from '~/entities/feeds'
import type { ManagerItem } from './types'

export const useSearchManagers = () => {
  const searchValue = ref('')

  const searchManagersResult = shallowRef<ManagerItem[]>([])

  const isOpenPopover = ref<boolean>(false)

  const searchStatus = ref<AsyncDataRequestStatus>('idle')

  let abortController: AbortController | null = null
  const { searchManagers: searchManagersApi } = useClientCatalogApi()

  const searchWithDelay = useDebounceFn(searchManagers, 500)

  async function searchManagers(value: string) {
    if (value.length < 3) {
      searchManagersResult.value = []
      return
    }

    const currentController = new AbortController()
    abortController = currentController

    try {
      searchStatus.value = 'pending'
      const data = await searchManagersApi(value, abortController)
      searchManagersResult.value = data
      searchStatus.value = 'success'
    } catch {
      searchStatus.value = 'error'
    } finally {
      if (abortController === currentController) {
        abortController = null
      }
    }
  }

  watch(searchValue, () => {
    if (abortController != null) {
      abortController.abort()
    }
    searchWithDelay(searchValue.value)
  })

  watchEffect(() => {
    if (searchStatus.value === 'success') {
      openPopover()
    } else {
      closePopover()
    }
  })

  function clearSearchValue() {
    searchValue.value = ''
  }

  function openPopover() {
    isOpenPopover.value = true
  }

  function closePopover() {
    isOpenPopover.value = false
  }

  function resetStatus() {
    searchStatus.value = 'idle'
  }

  return {
    searchValue,
    searchManagersResult,
    openPopover,
    closePopover,
    isOpenPopover,
    clearSearchValue,
    searchStatus,
    resetStatus
  }
}
