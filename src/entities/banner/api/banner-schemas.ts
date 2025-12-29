import { z } from 'zod'

export interface BannersOptionsReq {
  app: string
  categoryId: string | number
  page: string | number
  search: string
  sort: string
}

export const bannersSchema = z.object({
  currentPage: z.number(),
  extendedData: z.unknown(),
  items: z.array(
    z.object({
      categoryId: z.number(),
      categoryName: z.string(),
      id: z.number(),
      imgPath: z.string(),
      link: z.string(),
      name: z.string(),
      order: z.number(),
      regDate: z.string()
    })
  ),
  totalPages: z.number(),
  pageSize: z.number(),
  totalCount: z.number()
})

export type Banners = z.infer<typeof bannersSchema>

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

export const bannerSchema = z.object({
  id: z.number(),
  imgPath: z.string(),
  link: z.string(),
  name: z.string(),
  order: z.number(),
  regDate: z.string(),
  nn: z.number(),
  categoryId: z.number()
})

export type Banner = z.infer<typeof bannerSchema>
