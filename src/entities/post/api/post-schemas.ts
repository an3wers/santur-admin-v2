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

export const postSchema = z.object({
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

export type Post = z.infer<typeof postSchema>

export const postListSchema = z.object({
  ...postSchema.omit({ status: true, previewImgUrl: true, content: true }).shape,
  isPublished: z.boolean(),
  categoryName: z.string()
})

export type PostList = z.infer<typeof postListSchema>

export const postsSchema = z.object({
  currentPage: z.number(),
  items: z.array(postListSchema),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number()
})

export type Posts = z.infer<typeof postsSchema>

export interface SavePostReq {
  id: number
  title: string
  alias: string
  descr: string
  content: string
  categoryId: number
  date: string // example: 26.06.2023
  extFields: Pick<Post['extFields'][number], 'id' | 'title'>[]
  published: 'Y' | 'N'
  previewImage?: File
  previewImgUrl: string
}
