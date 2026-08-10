import { useFeedsApi } from '~/entities/feeds'
import { getKeyWithPrefix } from '../utlils/get-key-with-prefix'

export const useSaveFeedKey = (ctx: MaybeRefOrGetter<string>) => {
  const status = ref<ProcessStatus>('idle')
  const error = ref<string>('')

  const { saveFeedKey: saveFeedKeyApi } = useFeedsApi()
  async function saveFeedKey(payload: {
    name: string
    key: string
    descr: string
    strong: boolean
  }) {
    try {
      status.value = 'pending'
      error.value = ''
      const { descr, key, name, strong } = payload
      const keyWithPrefix = getKeyWithPrefix(key, toValue(ctx))
      await saveFeedKeyApi({
        key: keyWithPrefix,
        descr,
        strong,
        title: name
      })
      status.value = 'success'
    } catch (e) {
      console.error(e)
      error.value = e instanceof Error ? e.message : 'Что-то пошло не так'
      status.value = 'error'
    }
  }

  return { saveFeedKey, status, error }
}
