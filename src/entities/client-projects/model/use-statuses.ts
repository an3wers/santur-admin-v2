import { useClientProjectsApi } from '../api/client-projects-api'
import { getStatusColor } from '../lib/get-status-color'

export const useStatuses = () => {
  const { getStatuses } = useClientProjectsApi()
  return useAsyncData(getStatuses, {
    transform: (data) => {
      return data.map((el) => ({ label: el.val, value: el.key, color: getStatusColor(el.key) }))
    },
    lazy: true
  })
}
