import { getBannersCategoryKey } from '../api/query-keys'
import { useBannerApi } from '../api/banner-api'

export const useBannersCategory = async (
  catId: MaybeRef<string | number>,
  app: MaybeRef<string>
) => {
  const page = ref(1)
  const search = ref('')
  const sort = ref('nn')

  const api = useBannerApi()
  const { data, status, execute } = await useAsyncData(
    getBannersCategoryKey(unref(catId)),
    () =>
      api.getBanners({
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

  return { setPage, data, status, execute }
}
