import type { AsyncDataRequestStatus } from '#app'
import { FetchError } from 'ofetch'

export type RequestResult<T> = { ok: true; data: T } | { ok: false; error: Error }

export const useRequest = () => {
  const status = ref<AsyncDataRequestStatus>('idle')
  const error = shallowRef<Error | FetchError | null>(null)
  let activeId = 0

  async function handleRequest<T extends unknown = unknown>(
    fn: () => Promise<T>
  ): Promise<RequestResult<T>> {
    const callId = ++activeId
    status.value = 'pending'
    error.value = null

    try {
      const data = await fn()
      if (callId === activeId) {
        status.value = 'success'
      }
      return { ok: true, data }
    } catch (err) {
      const normalized =
        err instanceof FetchError || (err instanceof Error && err.name === 'FetchError')
          ? new Error('Произошла ошибка при запросе')
          : err instanceof Error
            ? err
            : new Error('Произошла ошибка')

      if (callId === activeId) {
        status.value = 'error'
        error.value = normalized
      }
      return { ok: false, error: normalized }
    }
  }

  return { status, error, handleRequest }
}
