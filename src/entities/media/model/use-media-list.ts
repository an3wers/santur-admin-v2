import { useNavStore } from '~/shared/navigation'
import { useMediaApi } from '../api/media-api'
import type { MediaListDto } from '../api/media-schemas'

export const useMediaList = () => {
  const api = useMediaApi()
  const navStore = useNavStore()
  const page = ref(1)
  const limit = 24

  function init() {
    page.value = 1
  }

  init()

  // TODO: Вынести key в константы
  const { data, status, error, refresh } = useAsyncData(
    'media-list',
    () =>
      api.getMediaFiles({
        app: navStore.activeResource,
        page: page.value.toString(),
        limit: limit.toString()
      }),
    {
      watch: [page],
      getCachedData(key, nuxtApp) {
        let cache = nuxtApp.payload.data[key] as MediaListDto | undefined

        if (cache && page.value !== cache.files.currentPage) {
          cache = undefined
        }

        return cache
      }
    }
  )
  if (status.value === 'success' && data.value) {
    page.value = data.value.files.currentPage
  }

  return {
    data,
    status,
    page,
    error,
    refresh
  }
}
