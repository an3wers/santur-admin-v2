import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type {
  ClientProjectDetailDto,
  ClientProjectDto,
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

  async function updateStatus(id: number, status: string) {
    const formData = new FormData()
    formData.append('id', String(id))
    formData.append('status', status)

    const res = await fetchWithToken('AdminSubjects/ClientProjectUpdateStatus', {
      method: 'POST',
      body: formData
    })

    return checkError(res).data
  }

  async function updateSum(id: number, sum: number) {
    const formData = new FormData()
    formData.append('id', String(id))
    formData.append('cost', String(sum))

    const res = await fetchWithToken('AdminSubjects_v2/ClientProjectUpdateCost', {
      method: 'POST',
      body: formData
    })

    return checkError(res).data
  }

  async function updatePoints(id: number, points: number) {
    const formData = new FormData()
    formData.append('id', String(id))
    formData.append('bonus', String(points))

    const res = await fetchWithToken('AdminSubjects/ClientProjectUpdateBonus', {
      method: 'POST',
      body: formData
    })

    return checkError(res).data
  }
  // ClientProjectUpdateParams([FromForm] int id, [FromForm] string status, [FromForm] int cost, [FromForm] int bonus, [FromForm] string comment = "")

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

  async function addComment(payload: {
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

    const res = await fetchWithToken('common/CommentAdd', {
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

  return {
    getClientProjects,
    getClientProjectsById,
    getStatuses,
    updateProjectState,
    addComment,
    removeComment
  }
}
