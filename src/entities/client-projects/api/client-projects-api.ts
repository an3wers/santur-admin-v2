import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { ClientProjectDetailDto, ClientProjectDto, ClientProjectsFilters } from './types'

export const useClientProjectsApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function getClientProjects(filters: ClientProjectsFilters = {}) {
    const res = await fetchWithToken<ClientProjectDto>('AdminSubjects/GetClientProjects', {
      method: 'POST',
      body: filters
    })

    return checkError(res).data
  }

  async function getClientProjectsById(id: number) {
    const query = new URLSearchParams({
      id: String(id)
    })
    const res = await fetchWithToken<ClientProjectDetailDto>(
      `AdminSubjects/GetClientProject?${query.toString()}`
    )
    return checkError(res).data
  }

  return {
    getClientProjects,
    getClientProjectsById
  }
}
