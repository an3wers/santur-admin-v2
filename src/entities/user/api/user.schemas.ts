import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  rights: z.string()
})

export type UserDto = z.infer<typeof userSchema>

export interface LoginRequest {
  username: string
  password: string
  deviceInfo: string
}

export const loginSchema = z.object({
  id: z.number(),
  accessToken: z.string(),
  refreshToken: z.string()
})

export type LoginDto = z.infer<typeof loginSchema>

export const refreshTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
})

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>

export const loginFogotSchema = z.string()
