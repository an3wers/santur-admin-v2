import { z } from 'zod'

export const extFieldsSchema = z.object({
  id: z.number(),
  title: z.string()
})

export type ExtFieldsDto = z.infer<typeof extFieldsSchema>

export const categorySchema = z.object({
  alias: z.string(),
  app: z.string(),
  id: z.number(),
  menuOrder: z.number(),
  name: z.string(),
  type: z.number(),
  customFields: z.array(z.unknown()).optional(),
  extFields: z.array(z.lazy(() => extFieldsSchema)),
  extendFields: z.nullable(z.array(z.unknown())).optional()
})

export type CategoryDto = z.infer<typeof categorySchema>

export interface SaveCategoryDto {
  id: number
  app?: string
  title?: string
  alias?: string
  extFields?: ExtFieldsDto[]
  type?: string
  menuOrder?: number
}
