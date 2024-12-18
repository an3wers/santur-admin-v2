import { useAppRequest } from '~/shared/libs/api/useAppRequests'
import { categorySchema, type CategoryDto, type SaveCategoryRequest } from './category.schemas'
import { z } from 'zod'

export const useCategoryApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()

  type CategoryIdResponse = number
  async function saveCategory(data: SaveCategoryRequest) {
    const res = await fetchWithToken<CategoryIdResponse>('Admin/SaveCategory', {
      method: 'POST',
      body: data
    })
    const _data = checkError(res).data
    return z.number().parse(_data)
  }

  async function removeCategory(id: string | number) {
    const query = new URLSearchParams({
      id: id.toString()
    })

    const res = await fetchWithToken<CategoryIdResponse>(`Admin/DeleteCategory?${query.toString()}`)
    const _data = checkError(res).data
    return z.number().parse(_data)
  }

  async function getCategory(id: string | number) {
    const query = new URLSearchParams({
      id: id.toString()
    })

    const res = await fetchWithToken<CategoryDto>(`Admin/GetCategory?${query.toString()}`)
    const _data = checkError(res).data
    return categorySchema.parse(_data)
  }

  // TODO: добавить проверку Zod схемы
  async function saveExtendField(id: number, categoryId: number, title: string) {
    const res = await fetchWithToken<unknown>('Admin/SaveExtendField', {
      method: 'POST',
      body: {
        id,
        categoryId,
        title
      }
    })
    return checkError(res)
  }

  // TODO: добавить проверку Zod схемы
  async function removeExtendField(extendFieldId: number) {
    const query = new URLSearchParams({
      extendFieldId: extendFieldId.toString()
    })

    const res = await fetchWithToken<unknown>(`Admin/DeleteExtendField?${query.toString()}`)

    return checkError(res)
  }

  // TODO: добавить проверку Zod схемы
  async function checkForExistsExtFieldValue(
    extendFieldId: string | number,
    categoryId: string | number
  ) {
    const query = new URLSearchParams({
      extendFieldId: extendFieldId.toString(),
      categoryId: categoryId.toString()
    })

    const res = await fetchWithToken<unknown>(
      `Admin/CheckForExistsExtFieldValue?${query.toString()}`
    )

    return checkError(res)
  }

  return {
    saveCategory,
    removeCategory,
    getCategory,
    saveExtendField,
    removeExtendField,
    checkForExistsExtFieldValue
  }
}
