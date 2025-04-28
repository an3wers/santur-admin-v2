import { usePostApi, getPostsCategoryKey } from '~/entities/post'

export const usePostsCategory = async (catId: MaybeRef<string | number>, app: MaybeRef<string>) => {
  const page = ref(1)
  const search = ref('')
  const sort = ref('nn')

  const api = usePostApi()
  const { data, status, execute } = await useAsyncData(
    getPostsCategoryKey(unref(catId)),
    () =>
      api.getPosts({
        app: unref(app),
        categoryId: unref(catId),
        page: String(page.value),
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

  return { data, status, execute, setPage, page, search, sort }
}
