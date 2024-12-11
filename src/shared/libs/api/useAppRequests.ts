import type { FetchOptionsType, RefreshTokenResponse, ResponseGatewayApi } from './types'

export const useAppRequest = () => {
  const { gatewayUrl } = useRuntimeConfig().public

  const makeRefreshToken = async () => {
    const deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const res = await baseFetch<RefreshTokenResponse>('/api/users/refresh-token', {
      method: 'POST',
      body: { deviceId }
    })

    return res.data
  }

  const checkError = <DataType>(res: ResponseGatewayApi<DataType>, message?: string) => {
    if (!res.success) {
      throw new Error(res.message || message || 'Произошла ошибка')
    }

    return res
  }

  const baseFetch = async <DataType>(url: string, options: FetchOptionsType = {}) => {
    const { $apiBase } = useNuxtApp()

    return await $apiBase<ResponseGatewayApi<DataType>>(url, options)
  }

  const fetchWithToken = async <DataType>(url: string, options: FetchOptionsType = {}) => {
    const token = useCookie('_user_token')

    if (!token.value) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const { $apiBase } = useNuxtApp()

    const _options: any = {
      ...options,
      baseURL: options.baseURL ? options.baseURL : gatewayUrl,
      ignoreResponseError: true,
      headers: { ...options?.headers, Authorization: `Bearer ${token.value}` }
    }

    let res = await $apiBase.raw<ResponseGatewayApi<DataType>>(url, _options)

    if (res.status === 401) {
      const { accessToken } = await makeRefreshToken()
      _options.headers = { ..._options.headers, Authorization: `Bearer ${accessToken}` }
      res = await $apiBase.raw<ResponseGatewayApi<DataType>>(url, _options) // Повторная попытка запроса
    } else if (res.status >= 400) {
      throw createError({ statusCode: res.status, statusMessage: res.statusText })
    }

    return res._data! //??
  }

  return { baseFetch, fetchWithToken, makeRefreshToken, checkError }
}
