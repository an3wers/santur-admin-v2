import { useNavStore } from '@/shared/navigation'

const tabs = ['Каталог', 'Бренды', 'Значки'] as const

interface FeedContext {
  currentFeed: Ref<string>
  selectFeed: (feedKey: string) => void
  feedLink: ComputedRef<string>
  tabs: typeof tabs
  activeTab: Ref<(typeof tabs)[number]>
  selectTab: (tab: (typeof tabs)[number]) => void
  feedSettings: ComputedRef<{
    canAddNewKey: boolean
    canEdit: boolean
    canEditKey: boolean
    canEditKeyName: boolean
    canRemove: boolean
    canViewFeedLink: boolean
  }>
}

const feedKey = Symbol() as InjectionKey<Ref<number>>

export function useFeedProvider() {
  const currentFeed = ref('YAND')
  function selectFeed(platformKey: string) {
    currentFeed.value = platformKey
  }

  const feedLink = computed(
    () => `https://isantur.ru/Client/GetCatalogFeed?key=${currentFeed.value}`
  )

  const activeTab = ref<(typeof tabs)[number]>('Каталог')

  const selectTab = (tab: (typeof tabs)[number]) => {
    activeTab.value = tab
  }
  const navStore = useNavStore()

  const feedSettings = computed(() => {
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

  provide<FeedContext>(feedKey, {
    currentFeed,
    selectFeed,
    feedLink,
    tabs,
    activeTab,
    selectTab,
    feedSettings
  })
}

export function useFeed() {
  const ctx = inject<FeedContext>(feedKey)

  if (!ctx) {
    throw new Error(
      'useFeed() должен вызываться внутри компонента, где был вызван useFeedProvider()'
    )
  }

  return ctx
}
