import { useBannerApi, type Banner } from '@/entities/banner'

export const userEditBannerItem = ({ catId }: { catId: number }) => {
  const originalBanner = shallowRef<Banner | null>(null)

  const banner = reactive<Banner & { dateTimestamp: number }>({
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

  // TODO: можно сделать рефакторинг
  const isModified = ref(false)

  watch(
    [() => banner.name, () => banner.imgPath, () => banner.link, () => banner.categoryId],
    ([newName, newImgPath, newLink, newCatId], [oldName, oldImgPath, oldLink, oldCatId]) => {
      if ((status.value === 'success' && oldName !== '') || status.value === 'idle') {
        isModified.value =
          (newName !== oldName && newName !== originalBanner.value?.name) ||
          (newImgPath !== oldImgPath && newImgPath !== originalBanner.value?.imgPath) ||
          (newLink !== oldLink && newLink !== originalBanner.value?.link) ||
          (newCatId !== oldCatId && newCatId !== originalBanner.value?.categoryId)
      }
    }
  )

  const api = useBannerApi()

  // TODO: можно ли заменить на useAsyncData?
  async function loadBanner(id: number) {
    try {
      status.value = 'pending'
      const data = await api.getBanner(id)

      // ??
      Object.assign(banner, data)
      originalBanner.value = data

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
