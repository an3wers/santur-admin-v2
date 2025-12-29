import type { Banner } from '@/entities/banner'
import { isEqual } from '~/shared/libs/is-equal'

export const userEditBannerItem = (
  catId: MaybeRefOrGetter<number>,
  initialBanner?: MaybeRefOrGetter<Banner>
) => {
  interface BannerItem extends Omit<Banner, 'app' | 'descr'> {
    dateTimestamp: number
  }

  let originalBanner: Omit<Banner, 'app' | 'descr'> | null = null // shallowRef<Banner | null>(null)

  const banner = ref<BannerItem>({
    categoryId: toValue(catId),
    id: 0,
    imgPath: '',
    link: '',
    name: '',
    nn: 0,
    dateTimestamp: Date.now()
  })

  // init banner and originalBanner from initialBanner
  watchEffect(() => {
    if (initialBanner && toValue(initialBanner)) {
      banner.value = {
        ...toValue(initialBanner),
        dateTimestamp: Date.now()
      }
      originalBanner = toValue(initialBanner)
    }
  })

  const isModified = ref(false)

  watch(
    [
      () => banner.value.name,
      () => banner.value.imgPath,
      () => banner.value.link,
      () => banner.value.categoryId
    ],
    ([newName, newImgPath, newLink, newCatId], [oldName, oldImgPath, oldLink, oldCatId]) => {
      isModified.value =
        (newName !== oldName && newName !== originalBanner?.name) ||
        (newImgPath !== oldImgPath && newImgPath !== originalBanner?.imgPath) ||
        (newLink !== oldLink && newLink !== originalBanner?.link) ||
        (newCatId !== oldCatId && newCatId !== originalBanner?.categoryId)
    }
  )

  function selectMedia(imagePath: string) {
    banner.value.imgPath = imagePath
  }

  function removeMedia() {
    banner.value.imgPath = ''
  }

  return { banner, selectMedia, removeMedia, isModified }
}
