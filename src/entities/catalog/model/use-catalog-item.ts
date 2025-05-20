import { generateAlias } from '~/shared/libs/generate-alias'
import { useCatalogApi } from '../api/catalog-api'
import type { GetCatalogItemDto } from '../api/catalog-schemas'
import type { CatalogItemModel } from './catalog-types'

export const useCatalogItem = () => {
  // TODO: Реализовать функционал с проверкой originalItem
  const _originalItem = null

  const catalogItem = reactive<CatalogItemModel>({
    id: 0,
    parent_id: 0,
    parent_name: '',
    vid: '',
    name: '',
    seotitle: '',
    keywords: '',
    alias: '',
    descr: '',
    shortDescr: '',
    imgExist: false
  })

  const status = ref<ProcessStatus>('idle')
  const isModified = ref(false)

  const api = useCatalogApi()

  async function loadCatalogItem(itemId: string | number) {
    try {
      status.value = 'pending'
      const data = await api.getCatalogItem(itemId)

      setCatalogItem(data)

      status.value = 'success'
    } catch (error) {
      console.log(error)
      status.value = 'error'
    }
  }

  function setCatalogItem(data: GetCatalogItemDto) {
    catalogItem.id = data.id
    catalogItem.parent_id = data.parent_id
    catalogItem.parent_name = data.parent_name
    catalogItem.vid = data.vid
    catalogItem.name = data.name
    catalogItem.seotitle = data.seotitle
    catalogItem.keywords = data.keywords
    catalogItem.alias = data.alias
    catalogItem.descr = data.descr
    catalogItem.shortDescr = data.shortDescr
    catalogItem.imgExist = data.imgExist
  }

  function reset() {
    catalogItem.id = 0
    catalogItem.parent_id = 0
    catalogItem.parent_name = ''
    catalogItem.vid = ''
    catalogItem.name = ''
    catalogItem.seotitle = ''
    catalogItem.keywords = ''
    catalogItem.alias = ''
    catalogItem.descr = ''
    catalogItem.shortDescr = ''
    catalogItem.imgExist = false

    status.value = 'idle'
    isModified.value = false
  }

  function createAlias(name: string) {
    const result = generateAlias(name)
    catalogItem.alias = result
  }

  return { catalogItem, status, isModified, loadCatalogItem, reset, createAlias }
}
