import type { Category } from './category-types'
import { useCategoryApi } from '../api/category-api'
import { useNavStore } from '~/shared/navigation'
import { generateAlias } from '~/shared/libs/generate-alias'
import { useRequest } from '~/shared/api/use-request'

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

  const categoryRequest = useRequest()
  const saveRequest = useRequest()
  const removeRequest = useRequest()
  const extFieldsRequest = useRequest()
  const checkExtFieldRequest = useRequest()

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

    const checkResult = await checkExtFieldRequest.handleRequest(() =>
      api.checkForExistsExtFieldValue(currFieldId, category.id)
    )

    if (!checkResult.ok) return false

    if (checkResult.data > 0) {
      showConfirmForRemoveField.value = true
      _fieldIdForRemove.value = currFieldId
      return false
    }

    const deleteResult = await deleteExtendField(currFieldId)

    if (deleteResult.ok) {
      category.extFields.splice(index, 1)
      return true
    }

    return false
  }

  async function removeAfterConfirm() {
    if (_fieldIdForRemove.value === -1) return

    const result = await deleteExtendField(_fieldIdForRemove.value)

    if (result.ok) {
      category.extFields = category.extFields.filter((f) => f.id !== _fieldIdForRemove.value)
      _fieldIdForRemove.value = -1
      showConfirmForRemoveField.value = false
    }
  }

  async function cancelRemoveConfirm() {
    _fieldIdForRemove.value = -1
    showConfirmForRemoveField.value = false
  }

  async function loadCategory(catId: number) {
    if (catId === 0) return

    const result = await categoryRequest.handleRequest(() => api.getCategory(catId))

    if (result.ok) {
      category.id = result.data.id
      category.alias = result.data.alias
      category.app = result.data.app
      category.name = result.data.name
      category.type = result.data.type
      category.menuOrder = result.data.menuOrder
      category.extFields = result.data.extFields
    }

    return result
  }

  async function saveCategory(type: string) {
    const filteredExtFields = category.extFields.filter((f) => f.title !== '')

    return saveRequest.handleRequest(() =>
      api.saveCategory({
        type,
        id: category.id,
        alias: category.alias ? category.alias : generateAlias(category.name),
        app: category.app,
        extFields: filteredExtFields,
        title: category.name,
        menuOrder: category.menuOrder
      })
    )
  }

  async function removeCategory() {
    if (category.id === 0) return

    return removeRequest.handleRequest(() => api.removeCategory(category.id))
  }

  async function deleteExtendField(extendFieldId: number) {
    return extFieldsRequest.handleRequest(() => api.removeExtendField(extendFieldId))
  }

  function $reset() {
    categoryRequest.status.value = 'idle'
    categoryRequest.error.value = null
    saveRequest.status.value = 'idle'
    saveRequest.error.value = null
    removeRequest.status.value = 'idle'
    removeRequest.error.value = null
    extFieldsRequest.status.value = 'idle'
    extFieldsRequest.error.value = null
    checkExtFieldRequest.status.value = 'idle'
    checkExtFieldRequest.error.value = null

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
    category,
    categoryStatus: categoryRequest.status,
    saveStatus: saveRequest.status,
    removeStatus: removeRequest.status,
    extFieldsStatus: extFieldsRequest.status,
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
