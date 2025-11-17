import { useBrandApi } from '~/entities/brand'
import { useFeedsApi, type FeedFilterRes } from '~/entities/feeds'
import { useNavStore } from '~/shared/navigation'
import { groupCatalogItems, useCatalogApi } from '~/entities/catalog'
import { useMessage } from 'naive-ui'
import { useSaveFeed } from './use-save-feed'
import type { FeedCategoryItem } from './types'
import { prefixKeysMap } from '../utlils/prefix-keys-map'
import { getKeyWithPrefix } from '../utlils/get-key-with-prefix'

export const useFeedsSetup = (ctx: MaybeRefOrGetter<string>) => {
  // feature setup

  // key with prefix
  const currentFeedKey = ref<string | null>(null)
  const makexmlfeed = ref(false)

  const currentFeedKeyWithoutPrefix = computed({
    get: () => {
      const key = currentFeedKey.value?.split(':')[1]
      return key ?? null
    },
    set: (value) => {
      setFeedKeyWithoutPrefix(value)
    }
  })

  function setFeedKey(key: string | null) {
    currentFeedKey.value = key
  }

  function setFeedKeyWithoutPrefix(key: string | null) {
    if (key == null) {
      currentFeedKey.value = null
      return
    }

    currentFeedKey.value = getKeyWithPrefix(key, toValue(ctx))
  }

  function setMakeXmlFeed(value: boolean) {
    makexmlfeed.value = value
  }
  const feedLink = computed(
    () => `https://isantur.ru/Client/GetCatalogFeed?key=${currentFeedKeyWithoutPrefix.value}`
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
      canAddNewKey: [1, 3].includes(navStore.currentSubmenuItem?.id || 0),
      canEdit: [1, 2, 3].includes(navStore.currentSubmenuItem?.id || 0),
      canEditKey: [1, 3].includes(navStore.currentSubmenuItem?.id || 0),
      canEditKeyName: [1, 2, 3].includes(navStore.currentSubmenuItem?.id || 0),
      canRemove: [1, 3].includes(navStore.currentSubmenuItem?.id || 0),
      canViewFeedLink: navStore.currentSubmenuItem?.id === 1
    }
  })

  // #region Feed-keys
  const { getFeedFilter, getFeedsKeys } = useFeedsApi()
  const {
    data: feedsKeysData,
    status: feedsKeysStatus,
    execute: feedsKeysExecute
  } = useAsyncData(
    `feeds-keys-${toValue(ctx)}`,
    () => getFeedsKeys(prefixKeysMap[toValue(ctx) as keyof typeof prefixKeysMap]),
    {
      transform: (data) => {
        return data.map((el) => {
          const key = el.key.split(':')[1]
          return {
            label: el.title,
            value: key, // key without prefix
            descr: el.descr
          }
        })
      },
      lazy: true
    }
  )

  const {
    data: feedFilterData,
    status: feedFilterStatus,
    execute: feedFilterExecute
  } = useAsyncData<FeedFilterRes | null>(
    `feed-filter-${toValue(ctx)}`,
    () => {
      if (currentFeedKey.value == null) {
        return Promise.resolve(null)
      }
      return getFeedFilter(currentFeedKey.value) // key with prefix
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
        setFeedKeyWithoutPrefix(feedsKeysData.value[0].value)
      } else {
        setFeedKey(null)
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
    // setFeedKey(key)
    setFeedKeyWithoutPrefix(key)
    await feedsKeysExecute()
  }

  async function removedKeyHandler() {
    await feedsKeysExecute()
    if (feedsKeysData.value?.length) {
      // setFeedKey(feedsKeysData.value[0].value)
      setFeedKeyWithoutPrefix(feedsKeysData.value[0].value)
    } else {
      setFeedKey(null)
    }
  }

  // #endregion

  // #region Category
  const { getCatalog } = useCatalogApi()

  const {
    data: feedCategoryData,
    status: feedCategoryStatus,
    execute: feedCategoryExecute
  } = useAsyncData(`feed-category-${toValue(ctx)}`, getCatalog, {
    transform: (data) => {
      const mapped = data.map((item) => ({
        id: item.id,
        name: item.name,
        parent_id: item.parent_id,
        vid: item.vid,
        isChecked:
          toValue(ctx) == '3'
            ? !!feedFilterData.value?.excludedCategories?.includes(item.id)
            : !feedFilterData.value?.excludedCategories?.includes(item.id)
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
          if (toValue(ctx) != '3' && !c.isChecked) {
            result.push(c.id)
          } else if (toValue(ctx) == '3' && c.isChecked) {
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
    `feed-brands-setup-${toValue(ctx)}`,
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
            isChecked:
              toValue(ctx) == '3'
                ? excludedBrands.value?.includes(b.name)
                : !excludedBrands.value?.includes(b.name)
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
      currentFeedKey.value, // key with prefix
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
    excludedBrands,
    currentFeedKeyWithoutPrefix,
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
