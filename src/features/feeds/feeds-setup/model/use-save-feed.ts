import { useFeedsApi, type FeedFilterReq } from '@/entities/feeds'

export const useSaveFeed = (_ctx?: string) => {
  const status = ref<ProcessStatus>('idle')

  const { saveFeedFilter } = useFeedsApi()

  async function saveFeed(key: string, data: FeedFilterReq, makexmlfeed: boolean) {
    try {
      status.value = 'pending'
      await saveFeedFilter(key, data, makexmlfeed)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { saveFeed, status }
}
