import type { ClientProjectDetailDto } from '~/entities/client-projects/api/types'
import type { ClientProjectDetail } from './types'

export function projectItemMapper(project: ClientProjectDetailDto): ClientProjectDetail {
  return {
    ...project,
    price: Number(project.prices),
    point: Number(project.points)
  }
}
