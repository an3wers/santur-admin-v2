import { z } from 'zod'

export type Statuses = 'Y' | 'N'

export interface BrandsOptionsDto {
  status: Statuses | string
  statusImg: Statuses | string
  statusDescr: Statuses | string
  letter: string
  search: string
}

/*
export interface GetBrandByIdResponse {
  brend: BrandsItem
  files: BrandFile[]
  logoSmallUrl: string
  logoBigUrl: string
}
*/

export const brandsItemSchema = z.object({
  thisObject: z.any().optional(),
  id: z.number(),
  name: z.string(),
  alias: z.string(),
  descr: z.string(),
  descrClear: z.string(),
  published: z.boolean(),
  logoSmallExist: z.boolean(),
  logoBigExist: z.boolean(),
  address: z.string(),
  phones: z.string(),
  email: z.string(),
  site: z.string(),
  contacts: z.string()
})

export type BrandsItemDto = z.infer<typeof brandsItemSchema>

export const brandsSchema = z.object({
  status: z.string(),
  statusImg: z.string(),
  statusDescr: z.string(),
  letter: z.string(),
  search: z.string(),
  brends: z.array(brandsItemSchema),
  letters: z.array(
    z.object({
      letter: z.string(),
      qty: z.number(),
      lng: z.string()
    })
  )
})

export type BrandsDto = z.infer<typeof brandsSchema>
