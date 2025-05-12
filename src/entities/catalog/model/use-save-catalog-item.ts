import type { CatalogItemModel } from './catalog-types'
import { useCatalogApi } from '../api/catalog-api'

export const useSaveCatalogItem = () => {
  const status = ref<ProcessStatus>('idle')

  const api = useCatalogApi()

  async function saveCatalogItem(item: Omit<CatalogItemModel, 'imgExist'> & { files?: File[] }) {
    try {
      const formData = new FormData()

      const { files, ...data } = item
      Object.keys(data).forEach((key) => {
        formData.append(key, String(data[key as keyof typeof data]))
      })

      if (files?.length) {
        formData.append('img', files[0])
      }

      status.value = 'pending'
      await api.saveCatalogItem(formData)
      status.value = 'success'
    } catch (error) {
      console.log(error)
      status.value = 'error'
    }
  }

  return { saveCatalogItem, status }
}
