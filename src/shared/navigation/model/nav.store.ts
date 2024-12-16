import { useNavApi } from '../api/nav.api'
import type { MenuItem, Resource } from './nav.types'
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'

export const useNavStore = defineStore('navigation', () => {
  const api = useNavApi()

  const navigation = ref<MenuItem[] | null>(null)
  const mapNavigation = ref<Record<string, MenuItem> | null>(null)

  const resources = ref<Resource[] | null>(null)
  const activeResource = ref('')

  const resourcesSelectore = computed(
    () => resources.value?.map((r) => ({ label: r.label, value: r.code })) ?? []
  )

  const getMenuOptions = computed(() => _mappingNavItemsToMenuOptions(navigation.value ?? []))

  const getSubMenuBySlug = computed(() => (slug: string) => {
    const navItem = mapNavigation.value?.[slug]

    if (!navItem) {
      return { label: '', items: [], needSubmenu: false }
    }

    return {
      label: navItem.label,
      items: _mappingNavItemsToMenuOptions(navItem.items),
      needSubmenu: navItem.needSubmenu
    }
  })

  async function loadMenu(recource: string): Promise<void> {
    try {
      const data = await api.getNavigation(recource)
      navigation.value = data
      mapNavigation.value = _mappingNavItemsToMap(data)
    } catch (error) {
      throw error
    }
  }

  async function loadResurces(): Promise<void> {
    try {
      const data = await api.getResources()
      resources.value = data
    } catch (error) {
      throw error
    }
  }

  function $reset(): void {
    navigation.value = null
    mapNavigation.value = null

    resources.value = null
    activeResource.value = ''
  }

  function saveActiveResourceToLS(resource: string): void {
    localStorage.setItem('active_resource', resource)
  }

  function getActiveResourceFromLS(): string | null {
    return import.meta.client ? localStorage.getItem('active_resource') : null
  }

  function setActiveResource(val: string): void {
    activeResource.value = val
  }

  function checkAndSetActiveResource() {
    let resLs = getActiveResourceFromLS()
    if (!resLs) {
      resLs = resources.value && resources.value?.length > 0 ? resources.value[0].code : ''
    }
    setActiveResource(resLs)
  }

  function _mappingNavItemsToMap(navItems: MenuItem[]): Record<string, MenuItem> {
    return navItems.reduce((acc: Record<string, MenuItem>, item) => {
      acc[item.modelName] = item
      return acc
    }, {})
  }

  function _mappingNavItemsToMenuOptions(navItems: MenuItem[]): MenuOption[] {
    if (!navItems.length) {
      return []
    }

    const mappedMenu: MenuOption[] = navItems.map((item) => {
      let path = ''
      if (item.modelName === 'media') {
        path = `/${item.modelName}/${item.categoryId}`
      } else if (item.modelName === 'analytics' || item.modelName === 'pvzs') {
        const isFirstLevel = item.categoryId === 0 && item.id !== 0 && item.needSubmenu
        path = isFirstLevel ? `/${item.modelName}` : `/${item.modelName}/${item.id}`
      } else {
        const isFirstLevel = item.categoryId === 0 && item.id !== 0
        path = isFirstLevel ? `/${item.modelName}` : `/${item.modelName}/${item.id}`
      }
      return {
        label: () => h(RouterLink, { to: { path } }, { default: () => item.label }),
        key: item.id
      }
    })
    return mappedMenu
  }

  return {
    navigation,
    mapNavigation,
    resources,
    activeResource,
    resourcesSelectore,
    getMenuOptions,
    getSubMenuBySlug,
    loadMenu,
    loadResurces,
    $reset,
    saveActiveResourceToLS,
    setActiveResource,
    checkAndSetActiveResource
  }
})
