import { useAppRequest } from '~/shared/libs/api/useAppRequests'
import {
  loginSchema,
  userSchema,
  type LoginDto,
  type LoginRequest,
  type UserDto,
  loginFogotSchema
} from './user.schemas'
import type { ErrorResponse, ResponseApi } from '~/shared/libs/api/types'

export const useUserApi = () => {
  const { checkError, baseFetch, makeRefreshToken } = useAppRequest()
  const { apiBase } = useRuntimeConfig().public

  async function loginAndGetToken(data: LoginRequest): Promise<LoginDto> {
    const res = await baseFetch('/api/users/login', {
      method: 'POST',
      body: data
    })
    const _data = checkError(res).data
    return loginSchema.parse(_data)
  }

  async function getUser(id: number | null): Promise<UserDto | null> {
    const _id = id ? id : 0

    let res: ResponseApi<UserDto> | ErrorResponse

    res = await baseFetch<UserDto>('/api/users/users?id=' + _id, {
      method: 'GET',
      ignoreResponseError: true
    })

    const isUser = (value: ResponseApi<UserDto> | ErrorResponse): value is ResponseApi<UserDto> => {
      if ('data' in value && value.data.id !== undefined) {
        return true
      }
      return false
    }

    const isError = (value: ResponseApi<UserDto> | ErrorResponse): value is ErrorResponse => {
      return 'message' in value
    }

    if (isError(res) && res.statusCode === 401) {
      await makeRefreshToken()

      res = await baseFetch<UserDto>('/api/users/users?id=' + _id, {
        method: 'GET',
        ignoreResponseError: true
      })
    } else if (isError(res) && res.statusCode >= 400) {
      throw createError({
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
      })
    }

    if (isUser(res)) {
      const _data = checkError(res).data
      return userSchema.parse(_data)
    }
    return null
  }

  async function logout(): Promise<null> {
    let res: any

    res = await baseFetch('/api/users/logout', { method: 'POST' })

    if (res.statusCode === 401) {
      await makeRefreshToken()
      res = await baseFetch('/api/users/logout', { method: 'POST' })
    } else if (res.statusCode >= 400) {
      throw createError({
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
      })
    }

    return checkError<null>(res).data
  }

  async function removeToken() {
    return await baseFetch<string>('/api/users/remove-token')
  }

  async function loginFogot(email: string) {
    const res = await baseFetch<string>(`apissz/LoginFogot/?u=${email}&tosms=N`, {
      baseURL: apiBase
    })
    const _data = checkError(res).data

    return loginFogotSchema.parse(_data)
  }

  return { loginAndGetToken, getUser, logout, removeToken, loginFogot }
}
