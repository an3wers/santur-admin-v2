import { useAppRequest } from '../libs/api/use-app-requests'

export const useCommonApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function getPossibleEntitiesForComment() {
    const res = await fetchWithToken('common/GetPossibleEntitiesForComment')
    return checkError(res).data
  }

  return { getPossibleEntitiesForComment }
}
