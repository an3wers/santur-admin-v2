import { getBannersCategoryKey, useBannerApi } from '@/entities/banner'

export const useBannersCategory = async (
  catId: MaybeRefOrGetter<number>,
  app: MaybeRefOrGetter<string>
) => {
  const page = ref(1)
  const search = ref('')
  const sort = ref('nn')

  const api = useBannerApi()
  const { data, status, execute } = await useAsyncData(
    getBannersCategoryKey(toValue(catId)),
    () =>
      api.getBanners({
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

  return { setPage, data, status, execute, page }
}
