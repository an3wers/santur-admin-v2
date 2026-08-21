import type { CatalogItemModel } from './catalog-types'
import { useCatalogApi } from '../api/catalog-api'

export const useRemoveCatalogItemImage = () => {
  const status = ref<ProcessStatus>('idle')

  const api = useCatalogApi()

  async function removeImage(item: Omit<CatalogItemModel, 'imgExist' | 'imgUrl'>) {
    try {
      status.value = 'pending'
      await api.removeImageCatalogItem({ id: item.id })
      status.value = 'success'
    } catch (error) {
      console.log(error)
      status.value = 'error'
    }
  }

  return { removeImage, status }
}
