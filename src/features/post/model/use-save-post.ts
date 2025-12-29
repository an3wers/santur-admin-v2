import type { SavePostReq } from '~/entities/post'
import { usePostApi } from '../../../entities/post/api/post-api'
import type { PostItem } from './types'

export const useSavePost = () => {
  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()
  async function savePost(data: PostItem) {
    const newData: SavePostReq = { ...data, published: data.published ? 'Y' : 'N' }
    try {
      status.value = 'pending'
      await api.savePost(newData)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { savePost, status }
}
