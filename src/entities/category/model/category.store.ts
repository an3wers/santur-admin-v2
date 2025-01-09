import type { Category } from './category.types'
import { useCategoryApi } from '../api/category.api'
import { useNavStore } from '~/shared/navigation'
import { generateAlias } from '~/shared/libs/generateAlias'

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
  const _fieldIdToRemove = ref(-1)

  const categoryStatus = ref<TProcessStatus>('idle')
  const categoryError = ref('')

  const saveStatus = ref<TProcessStatus>('idle')
  const saveError = ref('')

  const removeStatus = ref<TProcessStatus>('idle')
  const removeError = ref('')

  const extFieldsStatus = ref<TProcessStatus>('idle')
  const extFieldsError = ref('')

  function addExtendFiledInput() {
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
      _fieldIdToRemove.value = currFieldId
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
    if (_fieldIdToRemove.value === -1) return

    await deleteExtendField(_fieldIdToRemove.value)

    if (extFieldsStatus.value === 'success') {
      category.extFields = category.extFields.filter((f) => f.id !== _fieldIdToRemove.value)
      _fieldIdToRemove.value = -1
      showConfirmForRemoveField.value = false
    }
  }

  async function cancelRemoveConfirm() {
    _fieldIdToRemove.value = -1
    showConfirmForRemoveField.value = false
  }

  async function loadCategory(catId: number): Promise<void> {
    if (catId === 0) {
      // Лишняя операция
      // Object.assign(category, {
      //   alias: '',
      //   app: navStore.activeResource,
      //   extFields: [],
      //   id: 0,
      //   name: '',
      //   type: 0,
      //   menuOrder: 0
      // })
      return
    }

    try {
      categoryStatus.value = 'pending'
      categoryError.value = ''
      const data = api.getCategory(catId)
      Object.assign(category, data)

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
    } finally {
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

    _fieldIdToRemove.value = -1
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
    addExtendFiledInput,
    removeExtendFieldInput,
    $reset
  }
})
