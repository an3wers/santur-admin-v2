import { useNavStore } from '~/shared/navigation'

export const useFeedsSetup = defineStore('feedsSetup', () => {
  const currentFeedKey = ref('')

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

  const tabs = ['Каталог', 'Бренды', 'Значки'] as const

  const activeTab = ref<(typeof tabs)[number]>('Каталог')

  const selectTab = (tab: (typeof tabs)[number]) => {
    activeTab.value = tab
  }

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

  return {
    tabs,
    activeTab,
    feedPermissions,
    selectTab,
    setFeedKey,
    setMakeXmlFeed,
    feedLink,
    currentFeedKey
  }
})
