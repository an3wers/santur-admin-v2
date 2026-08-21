import { useCatalogApi } from '../api/catalog-api'

export const REMOVE_PRESET_FILTER_CONFIRM =
  'Вы действительно хотите удалить подфильтровую страницу?'

/**
 * Удаление подфильтровой страницы. Логика общая для формы редактирования
 * и для списка каталога, поэтому вынесена в отдельный composable.
 */
export const useRemovePresetFilter = () => {
  const api = useCatalogApi()

  const removeStatus = ref<ProcessStatus>('idle')

  function confirmRemove() {
    return window.confirm(REMOVE_PRESET_FILTER_CONFIRM)
  }

  async function remove(presetId: number) {
    if (removeStatus.value === 'pending') {
      return
    }

    try {
      removeStatus.value = 'pending'
      await api.deletePresetFilter(presetId)
      removeStatus.value = 'success'
    } catch (error) {
      console.error(error)
      removeStatus.value = 'error'
    }
  }

  function reset() {
    removeStatus.value = 'idle'
  }

  return {
    removeStatus,
    confirmRemove,
    remove,
    reset
  }
}
