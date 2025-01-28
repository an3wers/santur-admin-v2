import { z } from 'zod'

export const mediaListSchema = z.object({
  years: z.array(z.number()),
  months: z.array(z.object({ year: z.number(), monthNum: z.number(), month: z.string() })),
  selYear: z.number(),
  selMonth: z.number(),
  files: z.object({
    currentPage: z.number(),
    items: z.array(
      z.object({
        num: z.number(),
        year: z.number(),
        monthNum: z.number(),
        month: z.string(),
        regdate: z.string(),
        id: z.number(),
        imgPath: z.string(),
        fileName: z.string(),
        ext: z.string(),
        isImg: z.boolean()
      })
    ),
    pageSize: z.number(),
    totalCount: z.number(),
    totalPages: z.number()
  })
})

export type MediaListDto = z.infer<typeof mediaListSchema>
export type MediaListItemDto = MediaListDto['files']['items'][number]

export interface MediaFilesRequest {
  app: string
  page: string
  period?: string // example: `${year}:${month}`
  limit?: string
}

export interface UploadMediaFilesRequest {
  // app?: string
  files: File[]
}
