import { z } from 'zod'

export const pvzSchema = z.object({
  address: z.string(),
  cfo: z.string(),
  city: z.string(),
  code: z.string(),
  currentTaEmail: z.string(),
  currentTaReg: z.string(),
  descr: z.string(),
  forP: z.boolean(),
  forU: z.boolean(),
  gpsLat: z.string(),
  gpsLng: z.string(),
  gpscoords: z.string(),
  id: z.number(),
  isActive: z.boolean(),
  name: z.string(),
  ownerid: z.number(),
  payVariants: z.string(),
  phones: z.string(),
  times: z.string()
})

export type PvzDto = z.infer<typeof pvzSchema>

export interface SavePvzsItemDto {
  id?: number
  name: string
  city: string
  address: string
  phones: string
  times: string
  payvariants: string
  ownerid: number
  descr: string
  cfo: string
  code: string
  currentTaReg: string
  currentTaEmail: string
  forU: boolean
  forP: boolean
  gpsLat: string
  gpsLng: string
  isActive: boolean
}
