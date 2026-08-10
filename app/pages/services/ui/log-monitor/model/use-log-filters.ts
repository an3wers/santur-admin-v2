import type { LocationQueryRaw } from 'vue-router'
import type { LogFilters } from '~/entities/services'

// Копия query без указанных ключей (без dynamic delete).
function omitKeys(query: Record<string, unknown>, keys: readonly string[]): LocationQueryRaw {
  const out: LocationQueryRaw = {}
  for (const [k, v] of Object.entries(query)) {
    if (!keys.includes(k)) out[k] = v as LocationQueryRaw[string]
  }
  return out
}

// Двусторонняя привязка строкового значения к query string (шаринг ссылок, ТЗ 9.3).
// @vueuse/router в проекте не установлен, поэтому используем vue-router напрямую.
function useRouteQuery(key: string, defaultValue = '') {
  const route = useRoute()
  const router = useRouter()
  return computed<string>({
    get() {
      const v = route.query[key]
      return typeof v === 'string' ? v : defaultValue
    },
    set(value) {
      const query = omitKeys(route.query, [key])
      if (value) query[key] = value
      router.replace({ query })
    }
  })
}

const FILTER_KEYS = ['level', 'event', 'sessionId', 'userId', 'release', 'source'] as const

export function useLogFilters() {
  const route = useRoute()
  const router = useRouter()

  const level = useRouteQuery('level')
  const eventPrefix = useRouteQuery('event')
  const sessionId = useRouteQuery('sessionId')
  const userId = useRouteQuery('userId')
  const release = useRouteQuery('release')
  const source = useRouteQuery('source')

  const filters = computed<LogFilters>(() => ({
    level: level.value,
    eventPrefix: eventPrefix.value,
    sessionId: sessionId.value,
    userId: userId.value,
    release: release.value,
    source: source.value
  }))

  // Сброс всех фильтров одним переходом (чтобы не терять правки внутри одного тика).
  function reset() {
    router.replace({ query: omitKeys(route.query, FILTER_KEYS) })
  }

  return { level, eventPrefix, sessionId, userId, release, source, filters, reset }
}

// Отдельная привязка активной вкладки к query string.
export function useActiveTab(defaultTab: string) {
  const tab = useRouteQuery('tab', defaultTab)
  return computed<string>({
    get: () => tab.value || defaultTab,
    set: (v) => {
      tab.value = v
    }
  })
}
