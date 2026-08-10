import { usePostApi, getPostsCategoryKey } from '~/entities/post'

export const usePostsCategory = async (
  catId: MaybeRefOrGetter<number>,
  app: MaybeRefOrGetter<string>
) => {
  const page = ref(1)
  const search = ref('')
  const sort = ref('nn')

  const api = usePostApi()
  const { data, status, execute, error } = await useAsyncData(
    getPostsCategoryKey(toValue(catId)),
    () =>
      api.getPosts({
        app: toValue(app),
        categoryId: toValue(catId),
        page: page.value,
        search: search.value,
        sort: sort.value
      }),
    {
      watch: [page, search, sort]
    }
  )

  function setPage(newPage: number) {
    page.value = newPage

    scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return { data, status, execute, setPage, page, search, sort, error }
}
