import { useBannerApi } from '../api/banner-api'
import type { BannerItem } from './banner-types'

export const userBannerItem = ({ catId }: { catId: number }) => {
  const originalBanner = shallowRef<BannerItem | null>(null)

  const banner = reactive<BannerItem & { dateTimestamp: number }>({
    categoryId: catId,
    dateTimestamp: Date.now(),
    id: 0,
    imgPath: '',
    link: '',
    name: '',
    nn: 0,
    order: 0,
    regDate: ''
  })

  const status = ref<ProcessStatus>('idle')
  const isModified = ref(false)

  watch(
    [() => banner.name, () => banner.imgPath, () => banner.link, () => banner.categoryId],
    ([newName, newImgPath, newLink, newCatId], [oldName, oldImgPath, oldLink, oldCatId]) => {
      if ((status.value === 'success' && oldName !== '') || status.value === 'idle') {
        console.log({ newName, oldName, org: originalBanner.value?.name })
        isModified.value =
          (newName !== oldName && newName !== originalBanner.value?.name) ||
          (newImgPath !== oldImgPath && newImgPath !== originalBanner.value?.imgPath) ||
          (newLink !== oldLink && newLink !== originalBanner.value?.link) ||
          (newCatId !== oldCatId && newCatId !== originalBanner.value?.categoryId)
      }
    }
  )

  const api = useBannerApi()
  async function loadBanner(id: number) {
    try {
      status.value = 'pending'
      const res = await api.getBanner(id)
      Object.assign(banner, res)
      originalBanner.value = res
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  function selectMedia(imagePath: string) {
    banner.imgPath = imagePath
  }

  function removeMedia() {
    banner.imgPath = ''
  }

  return { loadBanner, banner, status, selectMedia, removeMedia, isModified }
}
