import { z } from 'zod'

export interface MenuItemDto {
  app: string | null
  categoryId: number
  id: number
  items: MenuItemDto[]
  label: string
  modelName: string
  needSubmenu: boolean
}

export const menuItemSchema: z.ZodType<MenuItemDto> = z.object({
  app: z.nullable(z.string()),
  categoryId: z.number(),
  id: z.number(),
  items: z.array(z.lazy(() => menuItemSchema)),
  label: z.string(),
  modelName: z.string(),
  needSubmenu: z.boolean()
})

export const resourceSchema = z.object({
  code: z.string(),
  label: z.string()
})

export type ResourceDto = z.infer<typeof resourceSchema>
