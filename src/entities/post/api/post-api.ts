import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import {
  type GetPostsReq,
  type SavePostReq,
  type PostItem,
  type PostsList,
  postsListSchema,
  postItemSchema
} from './post-schemas'

export const usePostApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()

  async function getPosts(data: GetPostsReq) {
    const res = await fetchWithToken<PostsList>('AdminContent/GetPosts', {
      query: data
    })

    const _data = checkError(res).data
    return postsListSchema.parse(_data)
  }

  async function getPost(postId: number) {
    const query = new URLSearchParams({
      id: postId.toString()
    })
    const res = await fetchWithToken<PostItem>(`AdminContent/GetPost?${query.toString()}`)
    const _data = checkError(res).data
    return postItemSchema.parse(_data)
  }

  async function savePost(data: SavePostReq) {
    // TODO: типизировать ответ
    const res = await fetchWithToken<unknown>('AdminContent/SavePost', {
      method: 'POST',
      body: createPost(data)
    })
    function createPost(data: SavePostReq) {
      const formdata = new FormData()
      formdata.append('id', data.id.toString())
      formdata.append('title', data.title)
      formdata.append('alias', data.alias)
      formdata.append('descr', data.descr)
      formdata.append('content', data.content)
      formdata.append('categoryId', data.categoryId.toString())
      formdata.append('published', data.published)
      formdata.append('date', data.date)
      formdata.append('extFields', JSON.stringify(data.extFields))
      formdata.append('previewImgUrl', data.previewImgUrl)
      if (data.previewImage) {
        const file = data.previewImage
        formdata.append('previewImage', file)
      }
      return formdata
    }

    return checkError(res).data
  }

  async function deletePost(postId: number) {
    const query = new URLSearchParams({
      id: postId.toString()
    })

    // TODO: типизировать ответ
    const res = await fetchWithToken<unknown>(`AdminContent/DeletePost?${query.toString()}`)

    return checkError(res).data
  }

  type PostId = number
  async function copyPost(postId: number) {
    const query = new URLSearchParams({
      id: postId.toString()
    })

    const res = await fetchWithToken<PostId>(`AdminContent/CopyPost?${query.toString()}`)
    return checkError(res).data
  }

  async function updateOrder(id: number, order: number) {
    const key = 'post'

    const query = new URLSearchParams({
      key,
      id: String(id),
      order: String(order)
    })

    // TODO: типизировать ответ
    const res = await fetchWithToken<unknown>(`AdminContent/UpdateOrder?${query.toString()}`)
    return checkError(res).data
  }

  return { getPosts, getPost, savePost, deletePost, copyPost, updateOrder }
}
