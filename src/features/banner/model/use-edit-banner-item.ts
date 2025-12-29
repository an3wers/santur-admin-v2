import type { Banner } from '@/entities/banner'
import { isEqual } from '~/shared/libs/is-equal'

export const userEditBannerItem = (
  catId: MaybeRefOrGetter<number>,
  initialBanner?: MaybeRefOrGetter<Banner>
) => {
  interface BannerItem extends Omit<Banner, 'app' | 'descr'> {
    dateTimestamp: number
  }

  let originalBanner: Omit<Banner, 'app' | 'descr'> | null = null

  const timestamp = Date.now()

  const banner = ref<BannerItem>({
    categoryId: toValue(catId),
    id: 0,
    imgPath: '',
    link: '',
    name: '',
    nn: 0,
    dateTimestamp: timestamp
  })

  watch(
    () => toValue(initialBanner),
    () => {
      if (toValue(initialBanner)) {
        banner.value = {
          ...toValue(initialBanner!),
          dateTimestamp: timestamp
        }
      }
      originalBanner = structuredClone({ ...banner.value })
    },
    {
      immediate: true
    }
  )

  const isModified = ref(false)

  watch(
    banner,
    () => {
      console.log({ banner: banner.value, originalBanner })
      isModified.value = !isEqual(banner.value, originalBanner)
    },
    {
      deep: true
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
