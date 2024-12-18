import { z } from 'zod'

export const extFieldsSchema = z.object({
  id: z.number(),
  title: z.string(),
  categoryId: z.number()
})

export type ExtFieldsDto = z.infer<typeof extFieldsSchema>

export const categorySchema = z.object({
  alias: z.string(),
  app: z.string(),
  customFields: z.array(z.unknown()),
  extFields: z.array(z.lazy(() => extFieldsSchema)),
  extendFields: z.nullable(z.array(z.unknown())),
  id: z.number(),
  menuOrder: z.number(),
  name: z.string(),
  type: z.string()
})

export type CategoryDto = z.infer<typeof categorySchema>

export interface SaveCategoryRequest {
  app: string
  id: number
  name: string
  type: string
  alias: string
  extFields: ExtFieldsDto[]
  menuOrder?: number
}
