import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { GetPostsDto, PostsDto, PostDetailDto, SavePostDto } from './post-schemas'

// TODO: Добавить Zod валидацию
export const usePostApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()

  async function getPosts(data: GetPostsDto) {
    const res = await fetchWithToken<PostsDto>('AdminContent/GetPosts', {
      query: data
    })
    return checkError(res).data
  }

  async function getPost(postId: number) {
    const query = new URLSearchParams({
      id: postId.toString()
    })
    const res = await fetchWithToken<PostDetailDto>(`AdminContent/GetPost?${query.toString()}`)

    return checkError(res).data
  }

  async function savePost(data: SavePostDto) {
    const res = await fetchWithToken<unknown>('AdminContent/SavePost', {
      method: 'POST',
      body: data
    })

    return checkError(res).data
  }

  async function deletePost(postId: number) {
    const query = new URLSearchParams({
      id: postId.toString()
    })

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

    // TODO: Типизировать + zod валидация
    const res = await fetchWithToken<unknown>(`AdminContent/UpdateOrder?${query.toString()}`)
    return checkError(res).data
  }

  return { getPosts, getPost, savePost, deletePost, copyPost, updateOrder }
}
