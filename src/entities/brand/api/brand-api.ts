import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import { type BrandsDto, type BrandsOptionsDto, brandsSchema } from './brand-schemas'

export const useBrandApi = () => {
  const { fetchWithToken, checkError } = useAppRequest()

  async function getBrands(options: BrandsOptionsDto) {
    const { letter, search, status, statusDescr, statusImg } = options
    const query = new URLSearchParams({
      status,
      statusImg,
      statusDescr,
      letter,
      search
    })
    const res = await fetchWithToken<BrandsDto>(`Admin/GetBrends?${query.toString()}`)
    const _data = checkError(res).data
    return brandsSchema.parse(_data)
  }

  async function changePublish(brandId: number) {
    const res = await fetchWithToken<'Y' | 'N'>(`Admin/BrendPublishedToggle?id=${brandId}`)
    return checkError(res).data
  }

  return { getBrands, changePublish }
}
