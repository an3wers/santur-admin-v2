import type { Category } from './category.types'
import { useCategoryApi } from '../api/category.api'

export const useCategoryStore = defineStore('category', () => {
  const api = useCategoryApi()

  const category = reactive<Category>({
    alias: '',
    app: '',
    extFields: [],
    id: 0,
    name: '',
    type: ''
  })

  const status = ref<TProcessStatus>('idle')
  const error = ref('')

  const saveStatus = ref<TProcessStatus>('idle')
  const saveError = ref('')

  const removeStatus = ref<TProcessStatus>('idle')
  const removeError = ref('')

  async function loadCategory(catId: number): Promise<void> {
    try {
      status.value = 'pending'
      error.value = ''
      const data = api.getCategory(catId)
      Object.assign(category, data)
    } catch (e) {
      const errorText = e instanceof Error ? e.message : JSON.stringify(e)
      error.value = errorText
      status.value = 'error'
    } finally {
      status.value = 'success'
    }
  }

  async function saveCategory() {
    try {
      saveStatus.value = 'pending'
      saveError.value = ''
      await api.saveCategory(category)
    } catch (e) {
      const errorText = e instanceof Error ? e.message : JSON.stringify(e)
      saveError.value = errorText
      saveStatus.value = 'error'
    } finally {
      saveStatus.value = 'success'
    }
  }

  async function removeCategory(id: number) {
    try {
      removeStatus.value = 'pending'
      removeError.value = ''
      await api.removeCategory(id)
    } catch (e) {
      const errorText = e instanceof Error ? e.message : JSON.stringify(e)
      removeError.value = errorText
      removeStatus.value = 'error'
    } finally {
      removeStatus.value = 'success'
    }
  }

  async function saveExtendField() {
    try {
    } catch (e) {
    } finally {
    }
  }

  async function deleteExtendField() {
    try {
    } catch (e) {
    } finally {
    }
  }
  async function getCountChildRecord() {
    try {
    } catch (e) {
    } finally {
    }
  }

  function $reset() {
    status.value = 'idle'
    saveStatus.value = 'idle'
    removeStatus.value = 'idle'

    error.value = ''
    saveError.value = ''
    removeError.value = ''

    category.alias = ''
    category.app = ''
    category.extFields = []
    category.id = 0
    category.name = ''
    category.type = ''
  }

  return {
    status,
    saveStatus,
    removeStatus,
    category,
    error,
    saveError,
    removeError,
    loadCategory,
    removeCategory,
    saveCategory,
    saveExtendField,
    deleteExtendField,
    getCountChildRecord,
    $reset
  }
})
