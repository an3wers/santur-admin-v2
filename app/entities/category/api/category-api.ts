import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import { categorySchema, type CategoryDto, type SaveCategoryDto } from './category-schemas'
import { z } from 'zod'

export const useCategoryApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()

  type CategoryIdResponse = number

  //TODO: Ответ бэкенда {"data":134,"success":false,"message":"OK"} - почему "success":false????

  async function saveCategory(data: SaveCategoryDto) {
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
    return _data // z.number().parse(_data) // С бэкенда не приходит id удаленной категории
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
  async function removeExtendField(extendFieldId: number) {
    const query = new URLSearchParams({
      extendFieldId: extendFieldId.toString()
    })

    const res = await fetchWithToken<unknown>(`Admin/DeleteExtendField?${query.toString()}`)
    /*
      Баг на серверной стороне, запрос возвращает 200 и выполняется успешно,
      но в теле ответа "success":false, из-за чего пришлось делать кастомную проверка, а не использовать checkError(res).data
    */

    if (!res.data) {
      throw new Error('Произошла ошибка')
    }

    return res.data
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

    const res = await fetchWithToken<number>(
      `Admin/CheckForExistsExtFieldValue?${query.toString()}`
    )

    return checkError(res).data
  }

  return {
    saveCategory,
    removeCategory,
    getCategory,
    // saveExtendField,
    removeExtendField,
    checkForExistsExtFieldValue
  }
}
