import { isEqual } from '~/shared/libs/is-equal'
import type { PostItem } from '@/entities/post'
import type { PostItemModel } from './types'
import { useCategoryApi } from '~/entities/category'

export const usePostEditItem = (
  catId: MaybeRefOrGetter<number>,
  initialPost?: MaybeRefOrGetter<PostItem>
) => {
  let originalPost: PostItemModel | null = null

  const timestamp = Date.now()

  const postItem = ref<PostItemModel>({
    id: 0,
    alias: '',
    categoryId: toValue(catId),
    content: '',
    description: '',
    extFields: [],
    previewImgUrl: '',
    regDateS: Date.now().toString(),
    title: '',
    timestamp: timestamp,
    published: false
  })

  const previewImage = ref<File | undefined>(undefined)
  const previewImageName = ref('')

  watch(
    () => toValue(initialPost),
    () => {
      if (initialPost && toValue(initialPost)) {
        postItem.value = {
          id: toValue(initialPost).id,
          alias: toValue(initialPost).alias,
          categoryId: toValue(initialPost).categoryId,
          content: toValue(initialPost).content,
          description: toValue(initialPost).description,
          extFields: toValue(initialPost).extFields,
          previewImgUrl: toValue(initialPost).previewImgUrl,
          regDateS: toValue(initialPost).regDateS,
          title: toValue(initialPost).title,
          timestamp: getTimestamp(toValue(initialPost).regDate),
          published: toValue(initialPost).status === 'published'
        }
      }
      // TODO: разобраться почему structuredClone не работает
      // originalPost = structuredClone({ ...postItem.value })
      originalPost = JSON.parse(JSON.stringify(postItem.value))
    },
    {
      immediate: true
    }
  )

  const isModified = ref(false)

  watch(
    postItem,
    () => {
      isModified.value = !isEqual(postItem.value, originalPost)
    },
    {
      deep: true
    }
  )

  // Заполняем extFields для нового поста
  const { getCategory } = useCategoryApi()
  watchEffect(async () => {
    if (postItem.value.id) {
      return
    }
    try {
      const category = await getCategory(postItem.value.categoryId)
      postItem.value.extFields = category.extFields.map((item) => {
        return {
          id: 0,
          title: item.title,
          extFieldId: item.id,
          value: ''
        }
      })
      // TODO: разобраться почему structuredClone не работает
      // originalPost = structuredClone({ ...postItem.value })
      originalPost = JSON.parse(JSON.stringify(postItem.value))
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  })

  function removeImage() {
    previewImage.value = undefined
    postItem.value.previewImgUrl = ''
    previewImageName.value = ''
  }

  function getTimestamp(date: string) {
    return new Date(date).getTime()
  }

  return { postItem, isModified, previewImage, previewImageName, removeImage }
}
