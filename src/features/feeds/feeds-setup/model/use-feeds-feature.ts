import { useBrandApi } from '~/entities/brand'
import { useFeedsApi, type FeedFilterRes } from '~/entities/feeds'
import { useNavStore } from '~/shared/navigation'
import { transformPlatformOptions } from '../utlils/transform-platform-options'
import { groupCatalogItems, useCatalogApi } from '~/entities/catalog'
import { useMessage } from 'naive-ui'
import { useSaveFeed } from './use-save-feed'
import type { FeedCategoryItem } from './types'

export const useFeedsFeature = (ctx: MaybeRefOrGetter<string>) => {
  const ctxVal = toValue(ctx)

  // feature setup
  const currentFeedKey = ref<string | null>(null)
  const makexmlfeed = ref(false)

  function setFeedKey(key: string) {
    currentFeedKey.value = key
  }
  function setMakeXmlFeed(value: boolean) {
    makexmlfeed.value = value
  }
  const feedLink = computed(
    () => `https://isantur.ru/Client/GetCatalogFeed?key=${currentFeedKey.value}`
  )

  // tabs state

  const tabs = ['Каталог', 'Бренды', 'Значки'] as const
  const activeTab = ref<(typeof tabs)[number]>('Каталог')
  const selectTab = (tab: (typeof tabs)[number]) => {
    activeTab.value = tab
  }

  // permissions
  const navStore = useNavStore()

  const feedPermissions = computed(() => {
    return {
      canAddNewKey: navStore.currentSubmenuItem?.id === 1, // xml-feed
      canEdit: navStore.currentSubmenuItem?.id === 1 || navStore.currentSubmenuItem?.id === 2,
      canEditKey: navStore.currentSubmenuItem?.id === 1,
      canEditKeyName:
        navStore.currentSubmenuItem?.id === 1 || navStore.currentSubmenuItem?.id === 2,
      canRemove: navStore.currentSubmenuItem?.id === 1,
      canViewFeedLink: navStore.currentSubmenuItem?.id === 1
    }
  })

  // #region Feed-keys
  const { getFeedFilter, getFeedsKeys } = useFeedsApi()
  const {
    data: feedsKeysData,
    status: feedsKeysStatus,
    execute: feedsKeysExecute
  } = useAsyncData(`feeds-keys-${ctxVal}`, () => getFeedsKeys(), {
    transform: (data) => {
      return transformPlatformOptions(ctxVal, data)
    },
    lazy: true
  })

  const {
    data: feedFilterData,
    status: feedFilterStatus,
    execute: feedFilterExecute
  } = useAsyncData<FeedFilterRes | null>(
    `feed-filter-${ctxVal}`,
    () => {
      if (currentFeedKey.value == null) {
        return Promise.resolve(null)
      }
      return getFeedFilter(currentFeedKey.value)
    },
    {
      immediate: currentFeedKey.value != null,
      watch: [currentFeedKey]
    }
  )

  watch(
    feedsKeysData,
    () => {
      if (feedsKeysData.value?.length) {
        setFeedKey(feedsKeysData.value[0].value)
      } else {
        setFeedKey('')
      }
    },
    {
      once: true
    }
  )

  const feedLoading = computed(() => {
    return feedsKeysStatus.value === 'pending' || feedFilterStatus.value === 'pending'
  })

  async function savedKeyHandler(key: string) {
    // if (key === currentFeedKey.value) {

    // }

    setFeedKey(key)
    await feedsKeysExecute()
  }

  async function removedKeyHandler(_key: string) {
    await feedsKeysExecute()
    if (feedsKeysData.value?.length) {
      setFeedKey(feedsKeysData.value[0].value)
    } else {
      setFeedKey('')
    }
  }

  // #endregion

  // #region Category
  const { getCatalog } = useCatalogApi()

  const {
    data: feedCategoryData,
    status: feedCategoryStatus,
    execute: feedCategoryExecute
  } = useAsyncData(`feed-category-${ctxVal}`, getCatalog, {
    transform: (data) => {
      const mapped = data.map((item) => ({
        id: item.id,
        name: item.name,
        parent_id: item.parent_id,
        vid: item.vid,
        isChecked: !feedFilterData.value?.excludedCategories?.includes(item.id)
      }))

      return { data: groupCatalogItems(mapped), fetchedAt: new Date() }
    },
    immediate: false
  })

  function getExcludedCategoryIds(payload: FeedCategoryItem[]): number[] {
    if (!payload.length) {
      return []
    }

    const result: number[] = [] // список id неотмеченных категорий

    payload.forEach((item) => {
      if (item.child) {
        item.child.forEach((c) => {
          if (!c.isChecked) {
            result.push(c.id)
          }
        })
      }
    })

    return result
  }

  // #endregion

  //#region Brands
  const currentLetter = ref('A')
  const excludedBrands = ref<string[]>([])

  function setLetter(letter: string) {
    currentLetter.value = letter
  }

  function toggleExcludedBrand(brand: string) {
    if (excludedBrands.value.includes(brand)) {
      excludedBrands.value = excludedBrands.value.filter((b) => b !== brand)
    } else {
      excludedBrands.value.push(brand)
    }
  }

  function initExcludedBrands(brands: string[]) {
    excludedBrands.value = brands
  }

  function resetBrandsState() {
    currentLetter.value = 'A'
    excludedBrands.value = []
  }

  const { getBrands } = useBrandApi()
  const {
    data: feedBrands,
    status: feedBrandsStatus,
    execute: feedBrandsExecute
  } = useAsyncData(
    'feed-brands-setup',
    () =>
      getBrands({
        letter: currentLetter.value,
        search: '',
        status: '',
        statusDescr: '',
        statusImg: ''
      }),
    {
      transform: (data) => {
        return {
          letters: data.letters.filter((l) => 'lng' in l) as {
            letter: string
            qty: number
            lng: string
          }[],
          brends: data.brends.map((b) => ({
            id: b.id,
            name: b.name,
            isChecked: !excludedBrands.value?.includes(b.name)
          }))
        }
      },
      immediate: false,
      watch: [currentLetter]
    }
  )

  //#endregion

  // #region SideEffects
  watchEffect(() => {
    if (feedFilterStatus.value === 'success' && feedFilterData.value) {
      feedCategoryStatus.value = 'idle'
      feedBrandsStatus.value = 'idle'
    }
  })

  watchEffect(async () => {
    if (
      activeTab.value === 'Каталог' &&
      feedCategoryStatus.value === 'idle' &&
      feedFilterStatus.value === 'success'
    ) {
      await feedCategoryExecute()
    }
  })

  watchEffect(async () => {
    if (
      activeTab.value === 'Бренды' &&
      feedBrandsStatus.value === 'idle' &&
      feedFilterStatus.value === 'success'
    ) {
      initExcludedBrands(feedFilterData.value?.excludedBrends || [])
      await feedBrandsExecute()
    }
  })

  // #endregion

  // #region SaveFeed
  const message = useMessage()
  const { saveFeed, status: saveFeedStatus } = useSaveFeed()

  async function saveFeedHandler() {
    if (currentFeedKey.value == null) return

    const excludedCategories = getExcludedCategoryIds(feedCategoryData.value!.data)

    await saveFeed(
      currentFeedKey.value,
      {
        excludedCategories,
        excludedBrends: excludedBrands.value,
        znaks: feedFilterData.value!.znaks,
        title: feedFilterData.value!.title,
        descr: feedFilterData.value!.descr
      },
      makexmlfeed.value
    )

    if (saveFeedStatus.value === 'success') {
      message.success('Данные успешно сохранены')
      resetBrandsState()
      await feedFilterExecute()
    } else {
      message.error('Произошла ошибка при сохранении')
    }
  }

  // #endregion

  return {
    feedLoading,
    tabs,
    activeTab,
    currentFeedKey,
    makexmlfeed,
    feedsKeysData,
    feedsKeysStatus,
    feedCategoryData,
    feedCategoryStatus,
    currentLetter,
    feedFilterData,
    feedFilterStatus,
    feedLink,
    feedPermissions,
    feedBrands,
    feedBrandsStatus,
    selectTab,
    setFeedKey,
    setMakeXmlFeed,
    feedsKeysExecute,
    feedFilterExecute,
    feedCategoryExecute,
    setLetter,
    saveFeedHandler,
    resetBrandsState,
    toggleExcludedBrand,
    savedKeyHandler,
    removedKeyHandler
  }
}
