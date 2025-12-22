import { usePostApi } from '../../../entities/post/api/post-api'
import type { SavePostReq } from '../../../entities/post/api/post-schemas'

export const useSavePost = () => {
  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()
  async function savePost(data: SavePostReq) {
    try {
      status.value = 'pending'
      await api.savePost(data)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { savePost, status }
}
