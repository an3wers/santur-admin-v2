import { useNavStore } from '~/shared/navigation'
import { useMediaApi } from '../api/media.api'

export const useMediaList = async () => {
  const api = useMediaApi()
  const navStore = useNavStore()
  const page = ref(1)

  const { data, status, error, refresh } = await useAsyncData(
    'media-list',
    () =>
      api.getMediaFiles({
        app: navStore.activeResource,
        page: page.value.toString()
      }),
    {
      watch: [page],
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || null
      }
    }
  )

  if (status.value === 'success') {
    page.value = data.value?.files.currentPage!
  }

  return {
    data,
    status,
    page,
    error,
    refresh
  }
}
