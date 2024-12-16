import { useAppRequest } from '~/shared/libs/api/useAppRequests'
import { type MenuItemDto, menuItemSchema, type ResourceDto, resourceSchema } from './nav.schema'

export const useNavApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()

  async function getNavigation(app: string) {
    const res = await fetchWithToken<MenuItemDto[]>(`Admin/MenuGet?app=${app}`)

    const _data = checkError(res).data

    return menuItemSchema.array().parse(_data)
  }

  async function getResources() {
    const res = await fetchWithToken<ResourceDto[]>('Admin/AppsGet')
    const _data = checkError(res).data
    return resourceSchema.array().parse(_data)
  }

  return { getNavigation, getResources }
}
