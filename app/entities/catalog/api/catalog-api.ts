import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type {
  DownloadTemplateOption,
  GetCatalogItemDto,
  GetCatalogVidsItemRes,
  GetPresetFiltersByCatalogItemRes,
  GetPresetsFilters,
  SavePresetFilterItem
} from './catalog-schemas'

export const useCatalogApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function getCatalog() {
    const res = await fetchWithToken<GetCatalogItemDto[]>('AdminGoods/GetTntks')
    return checkError(res).data
  }

  async function uploadCategoryDescriptionFromXls(data: FormData) {
    const res = await fetchWithToken<unknown>('AdminGoods/UpdateDescriptionsTntk', {
      method: 'POST',
      body: data
    })
    return checkError(res).data
  }

  async function getCatalogItem(itemId: string | number) {
    // const res = await fetchWithToken<GetCatalogItemDto>(`AdminGoods/GetTntk?id=${itemId}`)
    const res = await fetchWithToken<GetCatalogItemDto>(`AdminGoods/GetCatalogItem?id=${itemId}`)
    return checkError(res).data
  }

  async function saveCatalogItem(data: FormData) {
    const res = await fetchWithToken<unknown>('AdminGoods/PutTntk', {
      method: 'POST',
      body: data
    })
    return checkError(res).data
  }

  async function downloadDescriptionTemplate(tnName: string, option: DownloadTemplateOption) {
    const res = await fetchWithToken(
      `AdminGoods/GetDescriptionsTntk/?tn=${tnName}&option=${option}`
    )
    return res as unknown as Blob
  }

  async function getPresetsFilters() {
    const res = await fetchWithToken<GetPresetsFilters[]>('admin/catalog/GetPresetFilters')
    return checkError(res).data
  }

  async function getPresetFiltersByCatalogItem(tkId: number) {
    const res = await fetchWithToken<GetPresetFiltersByCatalogItemRes>(
      'admin/catalog/GetPresetFiltersByCatalogItem',
      {
        query: { id: tkId }
      }
    )
    return checkError(res).data
  }

  async function savePresetFilterForCatalogItem(data: SavePresetFilterItem) {
    // TODO: Replace to form data and add image field for attach file
    const res = await fetchWithToken<unknown>('admin/catalog/SavePresetFilterForCatalogItem', {
      method: 'POST',
      body: data
    })
    return checkError(res).data
  }

  // Удаление пресета
  // DeletePresetFilter
  async function deletePresetFilter(presetId: number) {
    const res = await fetchWithToken<unknown>('admin/catalog/DeletePresetFilter', {
      method: 'POST',
      query: {
        id: presetId
      }
    })
    return checkError(res).data
  }

  async function getCatalogVids(tkId?: number) {
    const res = await fetchWithToken<GetCatalogVidsItemRes[]>('AdminGoods/GetVids', {
      query: { tk_id: tkId }
    })
    return checkError(res).data
  }

  async function removeImageCatalogItem(data: {
    id: number
    parent_id: number
    parent_name: string
    vid: string
    name: string
    num: number
    seotitle: string
    keywords: string
    alias: string
    descr: string
    shortDescr: string
  }) {
    const res = await fetchWithToken<unknown>('AdminGoods/RemoveTntkImage', {
      method: 'POST',
      query: {
        id: data.id
      }
      // body: data
    })
    return checkError(res).data
  }

  return {
    getCatalog,
    uploadCategoryDescriptionFromXls,
    getCatalogItem,
    saveCatalogItem,
    downloadDescriptionTemplate,
    getPresetsFilters,
    getPresetFiltersByCatalogItem,
    savePresetFilterForCatalogItem,
    getCatalogVids,
    removeImageCatalogItem,
    deletePresetFilter
  }
}
