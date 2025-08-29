import {
  type BannersOptionsDto,
  type BannersDto,
  bannersSchema,
  type SaveBannerDto,
  type BannerDto
} from './banner-schemas'
import { useAppRequest } from '~/shared/libs/api/use-app-requests'

export const useBannerApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()
  async function getBanners(options: BannersOptionsDto): Promise<BannersDto> {
    const query = new URLSearchParams({
      ...options,
      page: options.page.toString(),
      categoryId: options.categoryId.toString()
    })

    const res = await fetchWithToken<BannersDto>(`AdminContent/GetBanners?${query.toString()}`)

    const _data = checkError(res).data
    return bannersSchema.parse(_data)
  }

  async function getBanner(id: number) {
    const query = new URLSearchParams({
      id: String(id)
    })
    const res = await fetchWithToken<BannerDto>(`AdminContent/GetBanner?${query.toString()}`)
    // TODO: zod валидация
    return checkError(res).data
  }

  async function saveBanner(data: SaveBannerDto) {
    const formData = new FormData()

    for (const key in data) {
      const value = data[key as keyof SaveBannerDto] as string
      formData.append(key, value)
    }

    const res = await fetchWithToken<{}>('AdminContent/SaveBannerV2', {
      method: 'POST',
      body: formData
    })
    // TODO: типизировавть + zod валидация
    return checkError(res).data
  }

  async function deleteBanner(id: number) {
    const query = new URLSearchParams({
      id: String(id)
    })

    const res = await fetchWithToken<unknown>(`AdminContent/DeleteBanner?${query.toString()}`)
    // TODO: типизировавть + zod валидация
    return checkError(res).data
  }

  // TODO: Валидный запрос возвращает ошибку, но при этом создает компию - разбираться с проблемой
  async function copyBanner(id: number) {
    const query = new URLSearchParams({
      id: String(id)
    })

    const res = await fetchWithToken<unknown>(`AdminContent/CopyBannerV2?${query.toString()}`)
    // TODO: типизировавть + zod валидация
    return checkError(res).data
  }

  async function updateOrder(id: number, order: number) {
    const key = 'banner'

    const query = new URLSearchParams({
      key,
      id: String(id),
      order: String(order)
    })

    // TODO: Типизировать + zod валидация
    const res = await fetchWithToken<unknown>(`AdminContent/UpdateOrder?${query.toString()}`)
    return checkError(res).data
  }

  return { getBanners, getBanner, saveBanner, deleteBanner, copyBanner, updateOrder }
}
