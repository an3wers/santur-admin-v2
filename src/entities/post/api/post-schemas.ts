import { z } from 'zod'

export interface GetPostsReq {
  app: string
  categoryId: number
  page: number
  search: string
  sort: string
}

export const extFieldsSchema = z.object({
  id: z.number(),
  extFieldId: z.number(),
  value: z.string(),
  title: z.string()
})

export const postItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  alias: z.string(),
  regDate: z.string(),
  regDateS: z.string(),
  content: z.string(),
  authorId: z.number(),
  categoryId: z.number(),
  author: z.string(),
  status: z.enum(['published', '']),
  previewImgUrl: z.string(),
  extFields: z.array(extFieldsSchema),
  order: z.number()
})

export type PostItem = z.infer<typeof postItemSchema>

export const postListSchema = z.object({
  ...postItemSchema.omit({ status: true, previewImgUrl: true, content: true, authorId: true })
    .shape,
  isPublished: z.boolean(),
  categoryName: z.string()
})

export type PostItemList = z.infer<typeof postListSchema>

export const postsListSchema = z.object({
  currentPage: z.number(),
  items: z.array(postListSchema),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number()
})

export type PostsList = z.infer<typeof postsListSchema>

export interface SavePostReq {
  id: number
  title: string
  alias: string
  descr: string
  content: string
  categoryId: number
  date: string // example: 26.06.2023
  extFields: PostItem['extFields']
  published: 'Y' | 'N'
  previewImage?: File
  previewImgUrl: string
}
