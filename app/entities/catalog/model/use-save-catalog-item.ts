import type { CatalogItemModel } from './catalog-types'
import { useCatalogApi } from '../api/catalog-api'
import { useRequest } from '~/shared/api/use-request'

export const useSaveCatalogItem = () => {
  const api = useCatalogApi()

  const saveRequest = useRequest()

  async function saveCatalogItem(
    item: Omit<CatalogItemModel, 'imgExist' | 'imgUrl'> & { files?: File[] }
  ) {
    const formData = new FormData()

    const { files, ...data } = item

    Object.keys(data).forEach((key) => {
      formData.append(key, String(data[key as keyof typeof data]))
    })

    if (files?.length && files[0] != null) {
      formData.append('img', files[0])
    }

    return saveRequest.handleRequest(() => api.saveCatalogItem(formData))
  }

  return {
    saveCatalogItem,
    status: saveRequest.status,
    error: saveRequest.error
  }
}
