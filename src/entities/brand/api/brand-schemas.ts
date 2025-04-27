import { z } from 'zod'

export type Statuses = 'Y' | 'N'

export interface BrandsOptionsDto {
  status: Statuses | string
  statusImg: Statuses | string
  statusDescr: Statuses | string
  letter: string
  search: string
}

export const brandsItemSchema = z.object({
  thisObject: z.any().optional(),
  id: z.number(),
  name: z.string(),
  alias: z.string(),
  descr: z.string(),
  descrClear: z.string(),
  published: z.boolean(),
  logoSmallExist: z.boolean(),
  logoBigExist: z.boolean(),
  address: z.string(),
  phones: z.string(),
  email: z.string(),
  site: z.string(),
  contacts: z.string()
})

export type BrandsItemDto = z.infer<typeof brandsItemSchema>

export const brandsSchema = z.object({
  status: z.string(),
  statusImg: z.string(),
  statusDescr: z.string(),
  letter: z.string(),
  search: z.string(),
  brends: z.array(brandsItemSchema),
  letters: z.array(
    z.object({
      letter: z.string(),
      qty: z.number(),
      lng: z.string()
    })
  )
})

export type BrandsDto = z.infer<typeof brandsSchema>

export const brandByIdSchema = z.object({
  brend: brandsItemSchema,
  files: z.array(
    z.object({
      category: z.string(),
      ext: z.string(),
      id: z.number(),
      lc: z.null(),
      lcd: z.string(),
      name: z.string()
    })
  ),
  logoSmallUrl: z.string(),
  logoBigUrl: z.string()
})

export type BrandByIdDto = z.infer<typeof brandByIdSchema>

export interface BrandFile {
  category: string
  ext: string
  id: number
  lc: null | any
  lcd: string
  name: string
}

export const fileList = {
  file1: 'Паспорт',
  file2: 'Сертификат дилера',
  file3: 'Cертификат',
  file4: 'Каталог',
  logobig: 'Большое лого',
  logosmall: 'Маленькое лого'
} as const

export type FilesKeys = keyof typeof fileList

export interface BrandSaveDto {
  id: number
  name: string
  descr: string
  alias: string
  address: string
  phones: string
  email: string
  site: string
  published: boolean
}

export interface BrandSaveFilesDto {
  key: FilesKeys
  file: File | undefined | null
}
