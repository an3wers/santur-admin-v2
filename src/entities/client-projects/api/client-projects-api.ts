import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type {
  ClientProjectDetailDto,
  ClientProjectDto,
  ClientProjectSettingsRes,
  ClientProjectsFilters,
  ClientProjectStatusesDto,
  UpdateProjectStateDto
} from './types'

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

  // Project details
  async function getStatuses() {
    const res = await fetchWithToken<ClientProjectStatusesDto[]>(
      'AdminSubjects/GetClientProjectStatuses'
    )
    return checkError(res).data
  }

  async function updateProjectState(payload: UpdateProjectStateDto) {
    const formData = new FormData()

    formData.append('id', String(payload.id))
    formData.append('status', payload.status)
    formData.append('cost', String(payload.cost))
    formData.append('bonus', String(payload.bonus))

    if (payload.comment) {
      formData.append('comment', payload.comment)
    }

    const res = await fetchWithToken('AdminSubjects/ClientProjectUpdateParams', {
      method: 'POST',
      body: formData
    })

    return checkError(res).data
  }

  async function saveComment(payload: {
    id: number
    entity: string
    entityId: string
    comment: string
    isprivate: boolean
  }) {
    const formData = new FormData()

    formData.append('id', String(payload.id))
    formData.append('entity', payload.entity)
    formData.append('entityId', payload.entityId)
    formData.append('comment', payload.comment)
    formData.append('isprivate', String(payload.isprivate))

    const res = await fetchWithToken('common/CommentSave', {
      method: 'POST',
      body: formData
    })

    return checkError(res).data
  }

  async function removeComment(id: number) {
    const res = await fetchWithToken('common/commentDelete', {
      method: 'GET',
      params: { id }
    })
    return checkError(res).data
  }

  async function getEngenitingSystems() {
    const res = await fetchWithToken('adminGoods/GetInzhSystems')
    return checkError(res).data
  }

  async function getClientProjectsSettings() {
    const res = await fetchWithToken<ClientProjectSettingsRes>('adminGoods/ClientProjectsGetFilter')
    return checkError(res).data
  }

  async function saveSettings(data: { systems: string[]; brends: string[] }) {
    const res = await fetchWithToken('adminGoods/ClientProjectsSaveFilter', {
      method: 'POST',
      body: {
        systems: data.systems,
        brends: data.brends
      }
    })

    return checkError(res).data
  }

  async function getSpendBonus(subjectId: number) {
    const res = await fetchWithToken('adminsubjects/GetRequestsToSpendBonus', {
      query: {
        subjectId
      }
    })
    return checkError(res).data
  }

  return {
    getClientProjects,
    getClientProjectsById,
    getStatuses,
    updateProjectState,
    saveComment,
    removeComment,
    getEngenitingSystems,
    getClientProjectsSettings,
    saveSettings,
    getSpendBonus
  }
}
