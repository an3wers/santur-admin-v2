import type { SubjectItem } from './types'

export const useCatalogSetup = () => {
  const currentSubject = ref<SubjectItem | null>()

  function setCurrentSubject(subject: SubjectItem) {
    currentSubject.value = subject
  }

  function clearSubject() {
    currentSubject.value = null
  }

  return { currentSubject, setCurrentSubject, clearSubject }
}
