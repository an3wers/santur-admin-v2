import type { NitroFetchOptions } from 'nitropack'
export type FetchOptionsType = NitroFetchOptions<
  '',
  'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
>

export interface ResponseApi<T> {
  data: T
  errorcode: number
  message: string
  success: boolean
}

export interface ResponseGatewayApi<T = Record<string, unknown>> {
  data: T
  message: string
  success: boolean
  errorcode?: number
}

export interface ErrorResponse {
  message: string
  stack: string
  statusCode: number
  statusMessage: string
  url: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}
