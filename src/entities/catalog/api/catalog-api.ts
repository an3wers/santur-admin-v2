import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type {
  DownloadTemplateOption,
  GetCatalogItemDto,
  GetPresetFiltersByCatalogItemRes,
  GetPresetsFilters,
  SaveNewPresetFilterItem
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
    const res = await fetchWithToken<GetCatalogItemDto>(`AdminGoods/GetTntk?id=${itemId}`)
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

  //  2) GET: api/admingoods/GetPresetFiltersByCatalogItem?id=100824
  //  где id - id товарной категории

  async function getPresetFiltersByCatalogItem(tkId: number) {
    const res = await fetchWithToken<GetPresetFiltersByCatalogItemRes>(
      'admin/catalog/GetPresetFiltersByCatalogItem',
      {
        query: { id: tkId }
      }
    )
    return checkError(res).data
  }

  //  3) POST:api/admingoods/SavePresetFilterForCatalogItem
  //  в боди структура:
  //  {
  //      "id":100001,
  //      "catalogItemId":100824,
  //      "title" : "Гидры больше 500 литров",
  //      "descr":"<p>самые огромные гидроаккумы</p>",
  //      "shortDescr":"Очень крупные",
  //      "presets": [{ "name":"Объем","selected":"500л;750л","minSelect":"","maxSelect":""}],
  //      "alias":"ochkrupnyie"
  //  }

  //  поле presets - массив, т.е. например  [
  // { "name":"Объем","selected":"500л;750л","minSelect":"","maxSelect":""},{"name":"Цена","selected":"","minSelect":"50000","MaxSelect":"400000"}
  //  ]
  //
  async function savePresetFilterForCatalogItem(data: SaveNewPresetFilterItem) {
    const res = await fetchWithToken<unknown>('admin/catalog/SavePresetFilterForCatalogItem', {
      method: 'POST',
      body: data
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
    savePresetFilterForCatalogItem
  }
}
