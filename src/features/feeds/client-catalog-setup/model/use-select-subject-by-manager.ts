export const useSelectSubjectByManager = () => {
  const selectedManagerEmail = ref<string>('')

  function setSelectedManagerEmail(email: string) {
    selectedManagerEmail.value = email
  }

  const isOpenSubjectsModal = ref<boolean>(false)

  function clearSelectedManager() {
    selectedManagerEmail.value = ''
  }

  function toggleSubjectsModal() {
    isOpenSubjectsModal.value = !isOpenSubjectsModal.value
  }

  watch(isOpenSubjectsModal, (newVal) => {
    if (!newVal) {
      clearSelectedManager()
    }
  })

  return {
    selectedManagerEmail,
    clearSelectedManager,
    toggleSubjectsModal,
    setSelectedManagerEmail,
    isOpenSubjectsModal
  }
}
