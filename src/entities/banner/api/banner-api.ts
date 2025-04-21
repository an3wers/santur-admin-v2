import { type BannersOptionsDto, type BannersDto, bannersSchema } from './banner-schemas'
import { useAppRequest } from '~/shared/libs/api/use-app-requests'

export const useBannerApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()
  async function getBanners(options: BannersOptionsDto): Promise<BannersDto> {
    const res = await fetchWithToken<BannersDto>('Admin/GetBanners', {
      query: new URLSearchParams({
        ...options,
        page: options.page.toString(),
        categoryId: options.categoryId.toString()
      })
    })

    const _data = checkError(res).data
    return bannersSchema.parse(_data)
  }

  return { getBanners }
}
