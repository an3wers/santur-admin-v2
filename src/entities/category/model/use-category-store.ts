import type { Category } from './category-types'
import { useCategoryApi } from '../api/category-api'
import { useNavStore } from '~/shared/navigation'
import { generateAlias } from '~/shared/libs/generate-alias'

export const useCategoryStore = defineStore('category', () => {
  const api = useCategoryApi()
  const navStore = useNavStore()

  const category = reactive<Category>({
    alias: '',
    app: navStore.activeResource,
    extFields: [],
    id: 0,
    name: '',
    type: 0,
    menuOrder: 0
  })

  const showConfirmForRemoveField = ref(false)
  const _fieldIdForRemove = ref(-1)

  const categoryStatus = ref<ProcessStatus>('idle')
  const categoryError = ref('')

  const saveStatus = ref<ProcessStatus>('idle')
  const saveError = ref('')

  const removeStatus = ref<ProcessStatus>('idle')
  const removeError = ref('')

  const extFieldsStatus = ref<ProcessStatus>('idle')
  const extFieldsError = ref('')

  function addExtendFieldInput() {
    category.extFields.push({
      id: 0,
      title: ''
    })
  }

  async function removeExtendFieldInput(index: number) {
    const currFieldId = category.extFields[index].id
    const unsavedField = currFieldId === 0

    if (unsavedField) {
      category.extFields.splice(index, 1)
      return true
    }

    const childCount = await api.checkForExistsExtFieldValue(currFieldId, category.id)

    if (childCount > 0) {
      showConfirmForRemoveField.value = true
      _fieldIdForRemove.value = currFieldId
      return false
    } else {
      await deleteExtendField(currFieldId)

      if (extFieldsStatus.value === 'success') {
        category.extFields.splice(index, 1)
        return true
      }

      return false
    }
  }

  async function removeAfterConfirm() {
    if (_fieldIdForRemove.value === -1) return

    await deleteExtendField(_fieldIdForRemove.value)

    if (extFieldsStatus.value === 'success') {
      category.extFields = category.extFields.filter((f) => f.id !== _fieldIdForRemove.value)
      _fieldIdForRemove.value = -1
      showConfirmForRemoveField.value = false
    }
  }

  async function cancelRemoveConfirm() {
    _fieldIdForRemove.value = -1
    showConfirmForRemoveField.value = false
  }

  async function loadCategory(catId: number): Promise<void> {
    if (catId === 0) {
      return
    }

    try {
      categoryStatus.value = 'pending'
      categoryError.value = ''
      const data = await api.getCategory(catId)

      category.id = data.id
      category.alias = data.alias
      category.app = data.app
      category.name = data.name
      category.type = data.type
      category.menuOrder = data.menuOrder
      category.extFields = data.extFields

      categoryStatus.value = 'success'
    } catch (e) {
      const errorText = e instanceof Error ? e.message : JSON.stringify(e)
      categoryError.value = errorText
      categoryStatus.value = 'error'
    }
  }

  async function saveCategory(type: string) {
    try {
      saveStatus.value = 'pending'
      saveError.value = ''

      const filteredExtFields = category.extFields.filter((f) => f.title !== '')

      await api.saveCategory({
        type,
        id: category.id,
        alias: category.alias ? category.alias : generateAlias(category.name),
        app: category.app,
        extFields: filteredExtFields,
        title: category.name,
        menuOrder: category.menuOrder
      })
      saveStatus.value = 'success'
    } catch (e) {
      const errorText = e instanceof Error ? e.message : JSON.stringify(e)
      saveError.value = errorText
      saveStatus.value = 'error'
    }
  }

  async function removeCategory() {
    if (category.id === 0) return

    try {
      removeStatus.value = 'pending'
      removeError.value = ''

      await api.removeCategory(category.id)

      removeStatus.value = 'success'
    } catch (e) {
      const errorText = e instanceof Error ? e.message : JSON.stringify(e)
      removeError.value = errorText
      removeStatus.value = 'error'
    }
  }

  // async function saveExtendField(payload: TExtFileds) {
  //   try {
  //     extFieldsStatus.value = 'pending'
  //     extFieldsError.value = ''
  //     await api.saveExtendField(payload.id, payload.categoryId, payload.title)
  //   } catch (e) {
  //     const errorText = e instanceof Error ? e.message : JSON.stringify(e)
  //     extFieldsError.value = errorText
  //     extFieldsStatus.value = 'error'
  //   } finally {
  //     extFieldsStatus.value = 'success'
  //   }
  // }

  async function deleteExtendField(extendFieldId: number) {
    try {
      extFieldsStatus.value = 'pending'
      extFieldsError.value = ''
      await api.removeExtendField(extendFieldId)

      extFieldsStatus.value = 'success'
    } catch (e) {
      const errorText = e instanceof Error ? e.message : JSON.stringify(e)
      extFieldsError.value = errorText
      extFieldsStatus.value = 'error'
    }
  }

  // async function getCountChildRecord(extendFieldId: number, categoryId: number) {
  //   try {
  //     extFieldsStatus.value = 'pending'
  //     extFieldsError.value = ''
  //     return await api.checkForExistsExtFieldValue(extendFieldId, categoryId)
  //   } catch (e) {
  //     const errorText = e instanceof Error ? e.message : JSON.stringify(e)
  //     extFieldsError.value = errorText
  //     extFieldsStatus.value = 'error'
  //   } finally {
  //     extFieldsStatus.value = 'success'
  //   }
  // }

  function $reset() {
    categoryStatus.value = 'idle'
    saveStatus.value = 'idle'
    removeStatus.value = 'idle'

    categoryError.value = ''
    saveError.value = ''
    removeError.value = ''

    extFieldsStatus.value = 'idle'
    extFieldsError.value = ''

    category.alias = ''
    category.app = navStore.activeResource
    category.extFields = []
    category.id = 0
    category.name = ''
    category.type = 0
    category.menuOrder = 0

    _fieldIdForRemove.value = -1
    showConfirmForRemoveField.value = false
  }

  return {
    categoryStatus,
    saveStatus,
    removeStatus,
    category,
    categoryError,
    saveError,
    removeError,
    extFieldsStatus,
    extFieldsError,
    showConfirmForRemoveField,
    removeAfterConfirm,
    cancelRemoveConfirm,
    loadCategory,
    removeCategory,
    saveCategory,
    deleteExtendField,
    addExtendFieldInput,
    removeExtendFieldInput,
    $reset
  }
})
