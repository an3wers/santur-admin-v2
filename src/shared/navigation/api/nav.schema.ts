import { z } from 'zod'

interface MenuItem {
  app: string
  categoryId: number
  id: number
  items: MenuItem[]
  label: string
  modelName: string
  needSubmenu: boolean
}

export const menuItemSchema: z.ZodType<MenuItem> = z.object({
  app: z.string(),
  categoryId: z.number(),
  id: z.number(),
  items: z.array(z.lazy(() => menuItemSchema)),
  label: z.string(),
  modelName: z.string(),
  needSubmenu: z.boolean()
})

export type MenuItemDto = z.infer<typeof menuItemSchema>

export const resourceSchema = z.object({
  code: z.string(),
  label: z.string()
})

export type ResourceDto = z.infer<typeof resourceSchema>
