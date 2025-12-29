import { isEqual } from '~/shared/libs/is-equal'
import { usePostApi } from '@/entities/post'
import type { PostItem } from './types'

export const usePostEditItem = ({ catId }: { catId: number }) => {
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
    published: false,
    previewImgUrl: '',
    previewImage: undefined
  })

  const isModified = ref(true)

  // TODO: Реализовать проверку на изменения
  // сейчас впринципе некорректно работает, так как postItem всегда указывает на один и тот же объект - newValue, oldValue всегда будут равны
  // также доработать проверка с учетом поля previewImage, originalPost не содержит этого поля
  // watch(postItem, (newValue, oldValue) => {
  //   if ((status.value === 'success' && oldValue.title !== '') || status.value === 'idle') {
  //     isModified.value = !(isEqual(newValue, oldValue) && isEqual(newValue, originalPost))
  //   }
  // })

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
      postItem.extFields = res.extFields ?? []
      postItem.published = res.status === 'published'
      postItem.descr = res.description
      postItem.dateTimestamp = getTimestamp(res.regDate)
      postItem.previewImgUrl = res.previewImgUrl

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
          extFields: res.extFields ?? [],
          published: res.status === 'published',
          previewImgUrl: res.previewImgUrl
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
