import {  z } from 'zod'

export const bannerSchema = z.object({
  app: z.string(),
  descr: z.string(),
  id: z.number(),
  name: z.string(),
  link: z.string(),
  imgPath: z.string(),
  nn: z.number(),
  categoryId: z.number(),
  images: z.array(
    z.object({ device: z.union([z.literal('desktop'), z.literal('mobile')]), imgPath: z.string() })
  ),
  published: z.string()
})

export type Banner = z.infer<typeof bannerSchema>

export const bannersSchema = z.object({
  currentPage: z.number(),
  extendedData: z.unknown(),
  items: z.array(
    z.object({
      ...bannerSchema.omit({ nn: true, app: true, descr: true }).shape,
      categoryName: z.string(),
      order: z.number(),
      regDate: z.string()
    })
  ),
  totalPages: z.number(),
  pageSize: z.number(),
  totalCount: z.number()
})

export type Banners = z.infer<typeof bannersSchema>

export interface GetBannersReq {
  app: string
  categoryId: number
  page: number
  search: string
  sort: string
}

export interface SaveBannerReq {
  id: number
  name: string
  images: BannerImage[]
  imgPath: string
  link: string
  nn: number
  categoryId: number
  app: string
  descr: string
  published: string
}
type DeviceType = 'desktop' | 'mobile';
export interface BannerImage {
  device: DeviceType
  imgPath: string
}

// Дополнительное изображение к сущности Баннер в админке.
// Для сохранения изображения в форме должны быть файлы с name например "desktop_img" и "mobile_img".
// На самом деле можно указать и другие имена но в одном должно присутствовать слово "desktop" а в другом "mobile".

// TS типы
// Типы устройств, для которых может быть изображение
// type DeviceType = 'desktop' | 'mobile'; // можно расширить в будущем

// interface BannerImage {
//   type: DeviceType;
//   imgPath: string;
// }

// interface SaveBannerReq {
//   id: number;
//   name: string;
//   images: BannerImage[]; // дополнительно к imgPath
//   link: string;
//   imgPath: string
//   nn: number;
//   categoryId: number;
//   app: string;
//   descr: string;
// }

// interface BannerResp {
//   id: number;
//   images: BannerImage[]; // дополнительно к imgPath
//   link: string;
//   imgPath: string
//   name: string;
//   order: number;
//   regDate: string;
//   nn: number;
//   categoryId: number;
// }
