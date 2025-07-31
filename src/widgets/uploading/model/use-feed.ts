import { useNavStore } from '@/shared/navigation'

const tabs = ['Каталог', 'Бренды'] as const

interface FeedContext {
  currentPlatform: Ref<string>
  selectPlatform: (platformKey: string) => void
  platformLink: ComputedRef<string>
  tabs: typeof tabs
  activeTab: Ref<(typeof tabs)[number]>
  selectTab: (tab: (typeof tabs)[number]) => void
  feedSettings: ComputedRef<{
    canAddNewKey: boolean
    canEdit: boolean
    canEditKey: boolean
    canEditKeyName: boolean
    canRemove: boolean
  }>
}

const feedKey = Symbol() as InjectionKey<Ref<number>>

export function useFeedProvider() {
  const currentPlatform = ref('YAND')
  function selectPlatform(platformKey: string) {
    currentPlatform.value = platformKey
  }

  const platformLink = computed(
    () => `https://isantur.ru/Client/GetCatalogFeed?key=${currentPlatform.value}`
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
      canRemove: navStore.currentSubmenuItem?.id === 1
    }
  })

  provide<FeedContext>(feedKey, {
    currentPlatform,
    selectPlatform,
    platformLink,
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
