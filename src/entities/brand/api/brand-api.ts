import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import {
  type BrandByIdDto,
  type BrandsDto,
  type BrandsOptionsDto,
  brandsSchema,
  brandByIdSchema,
  type BrandSaveDto,
  type BrandSaveFilesDto
} from './brand-schemas'

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
    const res = await fetchWithToken<BrandsDto>(`AdminGoods/GetBrends?${query.toString()}`)
    const _data = checkError(res).data
    return brandsSchema.parse(_data)
  }

  async function changePublish(brandId: number) {
    const res = await fetchWithToken<'Y' | 'N'>(`AdminGoods/BrendPublishedToggle?id=${brandId}`)
    return checkError(res).data
  }

  async function getBrand(brandId: number) {
    const res = await fetchWithToken<BrandByIdDto>(`AdminGoods/GetBrendDetail?id=${brandId}`)
    const _data = checkError(res).data
    return brandByIdSchema.parse(_data)
  }

  async function saveBrand(data: BrandSaveDto, files: BrandSaveFilesDto[]) {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof BrandSaveDto]
      formData.append(key, value.toString())
    })

    if (files.length) {
      files.forEach((file) => {
        formData.append(file.key, file.file as File)
      })
    }

    // TODO: типизировать
    const res = await fetchWithToken<unknown>('AdminGoods/BrendSave', {
      method: 'POST',
      body: formData
    })

    return checkError(res).data
  }

  async function removeLogo(brandId: string | number, size: 'small' | 'big' | 'both') {
    const res = await fetchWithToken<unknown>(
      `AdminGoods/RemoveLogoBrend?brendId=${brandId}&size=${size}`
    )
    return checkError(res).data
  }

  async function removeDocument(docId: number | string) {
    const res = await fetchWithToken<unknown>(`adminGoods/removeFileBrend?id=${docId}`)
    return checkError(res).data
  }

  return { getBrands, changePublish, getBrand, saveBrand, removeLogo, removeDocument }
}
