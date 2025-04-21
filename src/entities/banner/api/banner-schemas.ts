import { z } from 'zod'

export interface BannersOptionsDto {
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

export type BannersDto = z.infer<typeof bannersSchema>
