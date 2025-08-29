import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { ClientProjectDto } from './types'

export const useClientProjectsApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function getClientProjects() {
    const res = await fetchWithToken<ClientProjectDto>('AdminSubjects/GetClientProjects', {
      method: 'POST'
    })

    const _data = checkError(res).data
    return _data
  }

  return {
    getClientProjects
  }
}
