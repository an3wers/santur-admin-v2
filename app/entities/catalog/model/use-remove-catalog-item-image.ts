import type { CatalogItemModel } from './catalog-types'
import { useCatalogApi } from '../api/catalog-api'
import { useRequest } from '~/shared/api/use-request'

export const useRemoveCatalogItemImage = () => {
  const api = useCatalogApi()

  const removeImageRequest = useRequest()

  async function removeImage(item: Omit<CatalogItemModel, 'imgExist' | 'imgUrl'>) {
    return removeImageRequest.handleRequest(() => api.removeImageCatalogItem(item))
  }

  return {
    removeImage,
    status: removeImageRequest.status,
    error: removeImageRequest.error
  }
}
