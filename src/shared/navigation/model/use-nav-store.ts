import type { RolesValues } from '~/shared/config/constants'
import { useNavApi } from '../api/nav-api'
import type { MenuItem, Resource } from './nav-types'
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'

export const useNavStore = defineStore('navigation', () => {
  const api = useNavApi()
  const route = useRoute()

  const navigationWithZeroLavel = ref<MenuItem[] | null>(null)
  const navigation = ref<MenuItem[] | null>(null)
  const mapNavigation = ref<Record<string, MenuItem> | null>(null)

  const resources = ref<Resource[] | null>(null)
  const activeResource = ref('')

  const resourcesSelectore = computed(
    () => resources.value?.map((r) => ({ label: r.label, value: r.code })) ?? []
  )

  const getMenuOptions = computed(() => mappingNavItemsToMenuOptions(navigation.value ?? []))

  // const getMenuOptionsWithZeroLavel = computed<MenuOption[]>(() => {
  //   return (
  //     navigationWithZeroLavel.value?.map((zeroLavelItem) => {
  //       return {
  //         label: zeroLavelItem.label,
  //         key: `${zeroLavelItem.modelName}-${zeroLavelItem.id}`,
  //         children: mappingNavItemsToMenuOptions(zeroLavelItem.items)
  //       }
  //     }) || []
  //   )
  // })

  const getMenuOptionsWithZeroLavel = computed(() => (roles: RolesValues[]) => {
    const navs = applyPermissionsFilter(navigationWithZeroLavel.value ?? [], roles)
    return navs.map((zeroLavelItem) => {
      return {
        label: zeroLavelItem.label,
        key: `${zeroLavelItem.modelName}-${zeroLavelItem.id}`,
        children: mappingNavItemsToMenuOptions(zeroLavelItem.items)
      }
    })
  })

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
    const slug = route.path.split('/')[1]
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

  const currentSubmenuItem = computed(() => {
    if (currentNavigationMenu.value) {
      return currentNavigationMenu.value.items.find((item) => item.id === secondLevelId.value)
    } else {
      return null
    }
  })

  async function loadMenu(recource: string): Promise<void> {
    const data = await api.getNavigation(recource)
    const patched = data.map((item) => {
      if (item.modelName === 'analytics') {
        return {
          ...item,
          needSubmenu: false
        }
      }
      return item
    })
    const dataWithSomeOtherData = [...patched, ...createMenuItemExtend()]
    navigation.value = dataWithSomeOtherData
    mapNavigation.value = mappingNavItemsToMap(dataWithSomeOtherData)
    navigationWithZeroLavel.value = getFilledZeroLavel(createZeroLavel(), navigation.value)
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
      return {
        label: () =>
          h(RouterLink, { to: { path: createPath(item) } }, { default: () => item.label }),
        key: `${item.modelName}-${item.id}`
      }
    })

    function createPath(item: MenuItem): string {
      let result = ''
      if (item.modelName === 'media') {
        result = `/${item.modelName}`
      } else if (
        item.modelName === 'analytics' ||
        item.modelName === 'pvzs' ||
        item.modelName === 'uploading' ||
        item.modelName === 'feeds'
      ) {
        const isFirstLevel = item.categoryId === 0 && item.id !== 0 && item.needSubmenu
        result = isFirstLevel ? `/${item.modelName}` : `/${item.modelName}/${item.id}`
      } else {
        const isFirstLevel = item.categoryId === 0 && item.id !== 0
        result = isFirstLevel ? `/${item.modelName}` : `/${item.modelName}/${item.id}`
      }
      return result
    }

    return mappedMenu
  }

  function createMenuItemExtend(): MenuItem[] {
    return [
      // {
      //   app: '',
      //   categoryId: 0,
      //   id: 10,
      //   items: [
      //     {
      //       app: '',
      //       categoryId: 0,
      //       id: 1,
      //       items: [],
      //       label: 'XML-фиды',
      //       modelName: 'uploading',
      //       needSubmenu: false
      //     },
      //     {
      //       app: '',
      //       categoryId: 0,
      //       id: 2,
      //       items: [],
      //       label: 'santur.ru',
      //       modelName: 'uploading',
      //       needSubmenu: false
      //     }
      //   ],
      //   label: 'Выгрузки',
      //   modelName: 'uploading',
      //   needSubmenu: false
      // },
      {
        app: '',
        categoryId: 0,
        id: 10,
        items: [
          {
            app: '',
            categoryId: 0,
            id: 1,
            items: [],
            label: 'XML-фиды',
            modelName: 'feeds',
            needSubmenu: false
          },
          {
            app: '',
            categoryId: 0,
            id: 2,
            items: [],
            label: 'santur.ru',
            modelName: 'feeds',
            needSubmenu: false
          },
          {
            app: '',
            categoryId: 0,
            id: 3,
            items: [],
            label: 'Настройка по клиентам',
            modelName: 'feeds',
            needSubmenu: false
          }
        ],
        label: 'Настройка каталога',
        modelName: 'feeds',
        needSubmenu: false
      },
      {
        app: '',
        categoryId: 0,
        id: 11,
        items: [],
        label: 'Клиентские проекты',
        modelName: 'client-projects',
        needSubmenu: false
      }
    ]
  }

  function createZeroLavel(): MenuItem[] {
    return [
      {
        app: '',
        categoryId: 0,
        id: 100,
        items: [],
        label: 'Контент',
        modelName: 'content',
        needSubmenu: false
      },
      {
        app: '',
        categoryId: 0,
        id: 101,
        items: [],
        label: 'Аналитика',
        modelName: 'analytics',
        needSubmenu: false
      },
      // {
      //   app: '',
      //   categoryId: 0,
      //   id: 103,
      //   items: [],
      //   label: 'Выгрузки',
      //   modelName: 'uploading',
      //   needSubmenu: false
      // },
      {
        app: '',
        categoryId: 0,
        id: 103,
        items: [],
        label: 'Настройка каталога',
        modelName: 'feeds',
        needSubmenu: false
      },
      {
        app: '',
        categoryId: 0,
        id: 104,
        items: [],
        label: 'Проектирование',
        modelName: 'projecting',
        needSubmenu: false
      },
      {
        app: '',
        categoryId: 0,
        id: 105,
        items: [],
        label: 'Клиенты и заказы',
        modelName: 'orders-clients',
        needSubmenu: false
      },
      {
        app: '',
        categoryId: 0,
        id: 106,
        items: [],
        label: 'Сервисы',
        modelName: 'services',
        needSubmenu: false
      }
    ]
  }

  function getFilledZeroLavel(zeroLavel: MenuItem[], navigation: MenuItem[]): MenuItem[] {
    const buckets: Record<string, MenuItem> = {}

    zeroLavel.forEach((item) => {
      buckets[item.modelName] = item
    })

    navigation.forEach((item) => {
      switch (item.modelName) {
        case 'media':
        case 'banners':
        case 'posts':
        case 'brends':
        case 'tntks':
        case 'pvzs':
          buckets['content'].items.push(item)
          break
        case 'analytics':
          buckets['analytics'].items.push(...item.items)
          break
        // case 'uploading':
        //   buckets['uploading'].items.push(...item.items)
        //   break
        case 'feeds':
          buckets['feeds'].items.push(...item.items)
          break
        case 'client-projects':
          buckets['projecting'].items.push(item)
          break
        case 'orders-clients':
          // buckets['orders-clients'].items.push(item)
          break
        case 'services':
          // buckets['services'].items.push(item)
          break
      }
    })

    return zeroLavel
  }

  function applyPermissionsFilter(items: MenuItem[], roles: RolesValues[]): MenuItem[] {
    // let result: MenuItem[] = []
    const result = new Set<MenuItem>()

    roles.forEach((r) => {
      switch (r) {
        case 'SADM':
        case 'ADM':
        case 'DEVLP':
          // result = items
          items.forEach((item) => {
            result.add(item)
          })
          break
        case 'CLPADM':
          items.forEach((item) => {
            if (item.modelName === 'projecting') {
              result.add(item)
            }
          })
          break
        case 'MRKT':
          items.forEach((item) => {
            if (
              item.modelName === 'analytics' ||
              item.modelName === 'feeds' ||
              item.modelName === 'content'
            ) {
              result.add(item)
            }
          })

          break
        case 'CTLCLADM':
          items.forEach((item) => {
            if (item.modelName === 'analytics' || item.modelName === 'feeds') {
              result.add(item)
            }
          })

          break
        case 'VCNADM':
        case 'EXTRMRKT':
          items.forEach((item) => {
            if (item.modelName === 'content') {
              result.add(item)
            }
          })

          break
        case 'ISTA':
        case 'TA':
        case 'TP':
        default:
          break
      }
    })

    return Array.from(result)
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
    currentSubmenuItem,
    navigationWithZeroLavel,
    getMenuOptionsWithZeroLavel,
    loadMenu,
    loadResurces,
    $reset,
    saveActiveResourceToLS,
    setActiveResource,
    checkAndSetActiveResource,
    applyPermissionsFilter
  }
})
