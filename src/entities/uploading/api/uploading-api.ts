import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { ExportConstructorDto, FilterKeyDto } from './types'

export const useUploadingApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  // async function getExportConstructor(key: string) {
  //   const res = await fetchWithToken<ExportConstructorDto>('admin/GetExportConstructor?key=' + key)
  //   const _data = checkError(res).data
  //   return _data
  // }

  // Если сохраняем XML-фид
  async function saveExportConstructor(key: string, data: ExportConstructorDto) {
    const res = await fetchWithToken<ExportConstructorDto>(
      'export/SaveExportConstructor?key=' + key,
      {
        method: 'POST',
        body: data
      }
    )

    const _data = checkError(res).data
    return _data
  }

  async function saveCatalogFilter(key: string, data: ExportConstructorDto) {
    const res = await fetchWithToken<ExportConstructorDto>('admin/SaveCatalogFilter?key=' + key, {
      method: 'POST',
      body: data
    })

    const _data = checkError(res).data
    return _data
  }

  async function getCatalogFilterKeys() {
    const res = await fetchWithToken<FilterKeyDto[]>('admin/GetCatalogFilterKeys')
    const _data = checkError(res).data
    return _data
  }

  async function getCatalogFilter(key: string) {
    const res = await fetchWithToken<ExportConstructorDto>(`admin/GetCatalogFilter?key=${key}`)
    const _data = checkError(res).data
    return _data
  }

  async function saveCatalogFilterKey(
    key: string,
    payload?: { key: string; title: string; descr: string }
  ) {
    const formData = new FormData()

    if (payload) {
      formData.append('key', payload.key)
      formData.append('title', payload.title)
      formData.append('descr', payload.descr)
    }

    const res = await fetchWithToken('admin/SaveCatalogFilterKey', {
      method: 'POST',
      body: formData
    })

    const _data = checkError(res).data
    return _data
  }

  async function deleteCatalogFilterKey(key: string) {
    const res = await fetchWithToken(`admin/DeleteCatalogFilterKey?key=${key}`)
    const _data = checkError(res).data
    return _data
  }

  return {
    saveExportConstructor,
    getCatalogFilterKeys,
    saveCatalogFilterKey,
    getCatalogFilter,
    saveCatalogFilter,
    deleteCatalogFilterKey
  }
}
