import type { FetchOptionsType, RefreshTokenResponse, ResponseApi } from './types'
import type { FetchResponse } from 'ofetch'

export const useAppRequest = () => {
  const { apiGateway } = useRuntimeConfig().public

  function getResponseData<DataType>(response: FetchResponse<unknown>): ResponseApi<DataType> {
    if (
      response._data &&
      typeof response._data === 'object' &&
      'data' in response._data &&
      'success' in response._data
    ) {
      return response._data as ResponseApi<DataType>
    } else {
      return {
        data: response._data as DataType,
        success: response.ok,
        errorcode: response.status,
        message: response.statusText
      }
    }
  }

  const makeRefreshToken = async () => {
    const deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const res = await baseFetch<RefreshTokenResponse>('/api/users/refresh-token', {
      method: 'POST',
      body: { deviceId },
      onResponseError: async () => {
        // Зачем тут редирект?
        // const app = useNuxtApp()
        // app.$router.push({ path: '/profile/sign-in', query: { meta: 'error' } })
        await navigateTo({ path: '/profile/sign-in', query: { meta: 'error' } })
      }
    })

    return res.data
  }

  const checkError = <DataType>(res: ResponseApi<DataType>, message?: string) => {
    if (!res.success && res.data == null) {
      throw new Error(message || res.message || 'Произошла ошибка')
    }
    return res
  }

  const baseFetch = async <DataType>(
    url: string,
    options: FetchOptionsType = {}
  ): Promise<ResponseApi<DataType>> => {
    const { $apiBase } = useNuxtApp()

    const res = await $apiBase.raw<ResponseApi<DataType>>(url, options)
    return getResponseData(res)
  }

  const fetchWithToken = async <DataType>(
    url: string,
    options: FetchOptionsType = {}
  ): Promise<ResponseApi<DataType>> => {
    const token = useCookie('_user_token')

    if (!token.value) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const { $apiBase } = useNuxtApp()

    const _options: any = {
      ...options,
      baseURL: options.baseURL ? options.baseURL : apiGateway,
      ignoreResponseError: true,
      headers: { ...options?.headers, Authorization: `Bearer ${token.value}` }
    }

    let res = await $apiBase.raw<ResponseApi<DataType>>(url, _options)

    if (res.status === 401) {
      const { accessToken } = await makeRefreshToken()

      if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      }

      _options.headers = { ..._options.headers, Authorization: `Bearer ${accessToken}` }
      res = await $apiBase.raw<ResponseApi<DataType>>(url, _options) // Повторная попытка запроса
    } else if (res.status >= 400) {
      throw createError({ statusCode: res.status, statusMessage: res.statusText })
    }

    return getResponseData(res) //  res._data! //??
  }

  return { baseFetch, fetchWithToken, makeRefreshToken, checkError }
}
