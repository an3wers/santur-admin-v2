import { z } from 'zod'

export const bannerSchema = z.object({
  app: z.string(),
  descr: z.string(),
  id: z.number(),
  name: z.string(),
  link: z.string(),
  imgPath: z.string(),
  nn: z.number(),
  categoryId: z.number()
})

export type Banner = z.infer<typeof bannerSchema>

export const bannersSchema = z.object({
  currentPage: z.number(),
  extendedData: z.unknown(),
  items: z.array(
    z.object({
      ...bannerSchema.omit({ nn: true, app: true, descr: true }).shape,
      categoryName: z.string(),
      order: z.number(),
      regDate: z.string()
    })
  ),
  totalPages: z.number(),
  pageSize: z.number(),
  totalCount: z.number()
})

export type Banners = z.infer<typeof bannersSchema>

export interface GetBannersReq {
  app: string
  categoryId: number
  page: number
  search: string
  sort: string
}

export interface SaveBannerReq {
  id: number
  name: string
  imgPath: string
  link: string
  nn: number
  categoryId: number
  app: string
  descr: string
}
