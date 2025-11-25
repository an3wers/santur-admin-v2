import { useClientCatalogApi } from '~/entities/feeds'
import type { SubjectItem } from './types'
import type { AsyncDataRequestStatus } from '#app'

export const useSearchSubject = () => {
  const searchValue = ref('')

  const searchSubjectsResult = shallowRef<SubjectItem[]>([])

  const isOpenPopover = ref<boolean>(false)

  const searchStatus = ref<AsyncDataRequestStatus>('idle')

  let abortController: AbortController | null = null
  const { searchSubject } = useClientCatalogApi()

  const searchWithDelay = useDebounceFn(searchSubjects, 500)

  async function searchSubjects(value: string) {
    if (value.length < 3) {
      searchSubjectsResult.value = []
      return
    }

    const currentController = new AbortController()
    abortController = currentController

    try {
      searchStatus.value = 'pending'
      const data = await searchSubject(value, abortController)
      searchSubjectsResult.value = data
      searchStatus.value = 'success'
    } catch (error) {
      console.log('@', error)
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
    searchSubjectsResult,
    openPopover,
    closePopover,
    isOpenPopover,
    clearSearchValue,
    searchStatus,
    resetStatus
  }
}
