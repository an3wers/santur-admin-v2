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

  return { getCatalog, uploadCategoryDescriptionFromXls }
}

// export async function getProductCategory() {
//   const res = await fetchWithToken<ProductCategoryResponse[]>('Admin/GetTntks')
//   return checkError(res).data
// }

// export async function getProductCategoryById(id: string | null) {
//   const res = await fetchWithToken<GetProductCategoryByIdResponse>(`Admin/GetTntk?id=${id}`)

//   return checkError(res).data
// }

// export async function uploadProductCategoryChanges(data: FormData) {
//   const res = await fetchWithToken<unknown>('Admin/PutTntk', {
//     method: 'POST',
//     body: data
//   })
//   return checkError(res).data
// }

// export async function uploadDescriptionByXls(data: FormData) {
//   const res = await fetchWithToken<unknown>('Admin/UpdateDescriptionsTntk', {
//     method: 'POST',
//     body: data
//   })
//   return checkError(res).data
// }
