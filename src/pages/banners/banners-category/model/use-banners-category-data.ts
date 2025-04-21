import { getBannersCategoryKey, useBannerApi } from '~/entities/banner'

export const useBannersCategoryData = ({
  catId,
  app,
  page,
  search,
  sort
}: {
  catId: string
  app: string
  page: Ref<number>
  search: Ref<string>
  sort: Ref<string>
}) => {
  const { getBanners } = useBannerApi()

  return useAsyncData(
    getBannersCategoryKey(catId),
    () =>
      getBanners({
        app,
        page: page.value.toString(),
        categoryId: catId,
        search: search.value,
        sort: sort.value
      }),
    {
      watch: [page, search, sort],
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
      }
    }
  )
}
