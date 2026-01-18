import type { Banner } from '@/entities/banner'
import { isEqual } from '~/shared/libs/is-equal'

export const userEditBannerItem = (
  catId: MaybeRefOrGetter<number>,
  initialBanner?: MaybeRefOrGetter<Banner>
) => {
  interface BannerItem extends Omit<Banner, 'app' | 'descr'> {
    dateTimestamp: number
  }
  type mediaType = 'desktop' | 'mobile'

  let originalBanner: Omit<Banner, 'app' | 'descr'> | null = null

  const timestamp = Date.now()

  const banner = ref<BannerItem>({
    categoryId: toValue(catId),
    id: 0,
    imgPath: '',
    link: '',
    name: '',
    nn: 0,
    dateTimestamp: timestamp,
    images: [
      { device: 'desktop', imgPath: '' },
      { device: 'mobile', imgPath: '' }
    ],
    published: ''
  })
  console.log('anner', banner)

  watch(
    () => toValue(initialBanner),
    () => {
      if (toValue(initialBanner)) {
        banner.value = {
          ...toValue(initialBanner!),
          dateTimestamp: timestamp
        }
      }
      const rawState = toRaw(banner.value)
      originalBanner = JSON.parse(JSON.stringify(rawState))
      console.log('originalBanner', originalBanner)
    },
    {
      immediate: true
    }
  )

  const isModified = ref(false)

  watch(
    banner,
    () => {
      isModified.value = !isEqual(banner.value, originalBanner)
    },
    {
      deep: true
    }
  )

  function selectMedia(imagePath: string, mediaType: mediaType = 'desktop') {
    if (mediaType === 'desktop') banner.value.images[0].imgPath = imagePath
    if (mediaType === 'mobile') banner.value.images[1].imgPath = imagePath
    banner.value.imgPath = imagePath
  }

  function removeMedia(mediaType: mediaType) {
    banner.value.imgPath = ''
    if (mediaType === 'desktop') banner.value.images[0].imgPath = ''
    if (mediaType === 'mobile') banner.value.images[1].imgPath = ''
  }

  return { banner, selectMedia, removeMedia, isModified }
}
