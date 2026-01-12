import { formattedDateForServer, type SavePostReq } from '~/entities/post'
import { usePostApi } from '../../../entities/post/api/post-api'
import type { PostItemModel } from './types'

export const useSavePost = () => {
  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()
  async function savePost(data: PostItemModel & { previewImage?: File }) {
    const newData = {
      id: data.id,
      title: data.title,
      alias: data.alias,
      descr: data.description,
      content: data.content,
      categoryId: data.categoryId,
      published: data.published ? 'Y' : 'N',
      date: formattedDateForServer(new Date(data.timestamp)),
      extFields: data.extFields,
      previewImgUrl: data.previewImage ? '' : data.previewImgUrl,
      previewImage: data.previewImage
    } satisfies SavePostReq

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
