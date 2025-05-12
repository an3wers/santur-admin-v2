import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { GetCatalogItemDto } from './catalog-schemas'

export const useCatalogApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function getCatalog() {
    const res = await fetchWithToken<GetCatalogItemDto[]>('Admin/GetTntks')
    return checkError(res).data
  }

  async function uploadCategoryDescriptionFromXls(data: FormData) {
    const res = await fetchWithToken<unknown>('Admin/UpdateDescriptionsTntk', {
      method: 'POST',
      body: data
    })
    return checkError(res).data
  }

  async function getCatalogItem(itemId: string | number) {
    const res = await fetchWithToken<GetCatalogItemDto>(`Admin/GetTntk?id=${itemId}`)
    return checkError(res).data
  }

  async function saveCatalogItem(data: FormData) {
    const res = await fetchWithToken<unknown>('Admin/PutTntk', {
      method: 'POST',
      body: data
    })
    return checkError(res).data
  }

  return { getCatalog, uploadCategoryDescriptionFromXls, getCatalogItem, saveCatalogItem }
}
