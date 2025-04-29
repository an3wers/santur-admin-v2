import { isEqual } from '~/shared/libs/is-equal'
import { usePostApi } from '../api/post-api'
import type { PostItem } from './types'

export const usePostItem = ({ catId }: { catId: number }) => {
  let originalPost: PostItem | null = null

  const postItem = reactive<PostItem>({
    id: 0,
    title: '',
    alias: '',
    categoryId: catId,
    content: '',
    date: Date.now().toString(),
    dateTimestamp: Date.now(),
    descr: '',
    extFields: [],
    published: false
  })

  const isModified = ref(false)

  watch(postItem, (newValue, oldValue) => {
    if ((status.value === 'success' && oldValue.title !== '') || status.value === 'idle') {
      isModified.value = !(isEqual(newValue, oldValue) && isEqual(newValue, originalPost))
    }
  })

  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()
  async function loadPostItem(postId: number | string) {
    try {
      status.value = 'pending'
      const res = await api.getPost(Number(postId))

      postItem.id = res.id
      postItem.title = res.title
      postItem.alias = res.alias
      postItem.categoryId = res.categoryId
      postItem.content = res.content
      postItem.date = res.regDateS
      postItem.extFields = res.extFields
      postItem.published = res.status === 'published'
      postItem.descr = res.description
      postItem.dateTimestamp = getTimestamp(res.regDate)

      originalPost = JSON.parse(
        JSON.stringify({
          id: res.id,
          title: res.title,
          alias: res.alias,
          categoryId: res.categoryId,
          content: res.content,
          date: res.regDateS,
          dateTimestamp: getTimestamp(res.regDate),
          descr: res.description,
          extFields: res.extFields,
          published: res.status === 'published'
        })
      )

      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  function getTimestamp(date: string) {
    return new Date(date).getTime()
  }

  return { postItem, status, loadPostItem, isModified }
}
