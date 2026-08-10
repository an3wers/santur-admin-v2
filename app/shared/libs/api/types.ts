import type { NitroFetchOptions } from 'nitropack'
export type FetchOptionsType = NitroFetchOptions<
  '',
  'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
>

export interface ResponseApi<T = unknown> {
  data: T
  message: string
  success: boolean
  errorcode?: number
}

// export interface ResponseGatewayApi<T = unknown> {
//   data: T
//   message: string
//   success: boolean
// }

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
