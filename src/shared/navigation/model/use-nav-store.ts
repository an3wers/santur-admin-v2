import { useNavApi } from '../api/nav-api'
import type { MenuItem, Resource } from './nav-types'
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'

export const useNavStore = defineStore('navigation', () => {
  const api = useNavApi()
  const route = useRoute()

  const navigation = ref<MenuItem[] | null>(null)
  const mapNavigation = ref<Record<string, MenuItem> | null>(null)

  const resources = ref<Resource[] | null>(null)
  const activeResource = ref('')

  const resourcesSelectore = computed(
    () => resources.value?.map((r) => ({ label: r.label, value: r.code })) ?? []
  )

  const getMenuOptions = computed(() => mappingNavItemsToMenuOptions(navigation.value ?? []))

  const getSubMenuBySlug = computed(() => (slug: string) => {
    const navItem = mapNavigation.value?.[slug]

    if (!navItem) {
      return { label: '', items: [], needSubmenu: false }
    }

    return {
      label: navItem.label,
      items: mappingNavItemsToMenuOptions(navItem.items),
      needSubmenu: navItem.needSubmenu
    }
  })

  const navNameList = computed<string[]>(() => {
    return Object.keys(mapNavigation.value ?? {})
  })

  const firstLevelName = computed(() => {
    const slug = route.name?.toString().split('-')[0] ?? ''
    const currentName = navNameList.value.includes(slug) ? slug : ''
    return currentName
  })

  const secondLevelId = computed(() => {
    return route.params?.catId ? Number(route.params.catId) : -1
  })

  const currentSubmenu = computed(() => {
    return getSubMenuBySlug.value(firstLevelName.value)
  })

  const currentNavigationMenu = computed(() => {
    return mapNavigation.value?.[firstLevelName.value]
  })

  async function loadMenu(recource: string): Promise<void> {
    const data = await api.getNavigation(recource)
    const dataWithSomeOtherData = [...data, createUploadingMenuItem()]
    navigation.value = dataWithSomeOtherData
    mapNavigation.value = mappingNavItemsToMap(dataWithSomeOtherData)
  }

  async function loadResurces(): Promise<void> {
    const data = await api.getResources()
    resources.value = data
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

  function mappingNavItemsToMap(navItems: MenuItem[]): Record<string, MenuItem> {
    return navItems.reduce((acc: Record<string, MenuItem>, item) => {
      acc[item.modelName] = item
      return acc
    }, {})
  }

  // TODO: Рефакторинг, можно перенести в утилиты
  function mappingNavItemsToMenuOptions(navItems: MenuItem[]): MenuOption[] {
    if (!navItems.length) {
      return []
    }

    const mappedMenu: MenuOption[] = navItems.map((item) => {
      let path = ''
      if (item.modelName === 'media') {
        path = `/${item.modelName}`
      } else if (
        item.modelName === 'analytics' ||
        item.modelName === 'pvzs' ||
        item.modelName === 'uploading'
      ) {
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

  function createUploadingMenuItem(): MenuItem {
    return {
      app: 'santur',
      categoryId: 0,
      id: 10,
      items: [
        {
          app: 'santur',
          categoryId: 0,
          id: 1,
          items: [],
          label: 'XML feed',
          modelName: 'uploading',
          needSubmenu: false
        }
      ],
      label: 'Выгрузки',
      modelName: 'uploading',
      needSubmenu: true
    }
  }

  return {
    navigation,
    mapNavigation,
    resources,
    activeResource,
    resourcesSelectore,
    getMenuOptions,
    getSubMenuBySlug,
    firstLevelName,
    secondLevelId,
    navNameList,
    currentSubmenu,
    currentNavigationMenu,
    loadMenu,
    loadResurces,
    $reset,
    saveActiveResourceToLS,
    setActiveResource,
    checkAndSetActiveResource
  }
})
