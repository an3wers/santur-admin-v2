import type {
  LogEvent,
  LogFilters,
  LogQueryParams,
  ErrorRatePoint,
  KpiPoint,
  DomainErrorRow,
  TopErrorRow,
  OverviewCounters
} from './log-types'

// Прокси-путь до log-server: routeRule `/api-logger/**` → API_BFF (nuxt.config.ts).
// Относительный URL → запрос идёт на origin admin app и проксируется без CORS (ТЗ 9.1).
const LOG_QUERY_URL = '/api-logger/admin/query'

// Экранирование значения для строкового фильтра LogsQL: оборачиваем в кавычки.
function ql(value: string | number): string {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

// Построчный парсинг NDJSON (ТЗ Ф-5.3). Битые строки пропускаются — парсинг не падает.
export function parseNdjson<T = Record<string, unknown>>(text: string): T[] {
  const out: T[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      out.push(JSON.parse(trimmed) as T)
    } catch {
      // пропускаем некорректную строку
    }
  }
  return out
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

// Собирает выражение фильтра LogsQL из фильтров Live tail.
function buildFilterExpr(filters: Partial<LogFilters>): string {
  const parts: string[] = []
  if (filters.level) parts.push(`level:${ql(filters.level)}`)
  if (filters.eventPrefix) parts.push(`_msg:${ql(filters.eventPrefix)}*`)
  if (filters.sessionId) parts.push(`sessionId:${ql(filters.sessionId)}`)
  if (filters.userId) parts.push(`userId:${ql(filters.userId)}`)
  if (filters.release) parts.push(`release:${ql(filters.release)}`)
  if (filters.source) parts.push(`source:${ql(filters.source)}`)
  return parts.join(' ')
}

export const useLogQueryApi = () => {
  // Низкоуровневый запрос к log-server. Возвращает сырой ответ (NDJSON/text).
  async function run(params: LogQueryParams): Promise<string> {
    return await $fetch<string>(LOG_QUERY_URL, {
      method: 'POST',
      body: params,
      responseType: 'text'
    })
  }

  // --- LogsQL-билдеры (ТЗ 8.3 / 9.2) ---

  // Счётчики обзора одним запросом (условные агрегаты LogsQL).
  async function getOverviewCounters(start?: string, end?: string): Promise<OverviewCounters> {
    const query =
      '* | stats ' +
      'count() if (level:error) errors, ' +
      'count() if (_msg:"network.error") network, ' +
      'count() if (_msg:"checkout.order.failed") order'
    const text = await run({ endpoint: 'query', query, start, end })
    const row = parseNdjson<Record<string, unknown>>(text)[0] ?? {}
    return {
      errors: num(row.errors),
      network: num(row.network),
      order: num(row.order)
    }
  }

  // KPI-тайм-серия по 1-часовым бакетам: питает крупные числа и спарклайны карточек.
  // Имя события хранится в `_msg` (VictoriaLogs), поле `event` в схеме отсутствует.
  async function getKpiSeries(start?: string, end?: string): Promise<KpiPoint[]> {
    const query =
      '* | stats by (_time:1h) ' +
      'count() if (level:error) errors, ' +
      'count() if (_msg:"network.error") network, ' +
      'count() if (_msg:"checkout.order.failed") order, ' +
      'count() if (_msg:"js.error") js ' +
      '| sort by (_time)'
    const text = await run({ endpoint: 'query', query, start, end })
    return parseNdjson<Record<string, unknown>>(text).map((r) => ({
      time: String(r._time ?? ''),
      errors: num(r.errors),
      network: num(r.network),
      order: num(r.order),
      js: num(r.js)
    }))
  }

  // Error rate по 5-минутным бакетам: всего ошибок + разбивка network/js для line-chart.
  async function getErrorRate(start?: string, end?: string): Promise<ErrorRatePoint[]> {
    const query =
      'level:error | stats by (_time:5m) ' +
      'count() total, ' +
      'count() if (_msg:"network.error") network, ' +
      'count() if (_msg:"js.error") js ' +
      '| sort by (_time)'
    const text = await run({ endpoint: 'query', query, start, end })
    return parseNdjson<Record<string, unknown>>(text).map((r) => ({
      time: String(r._time ?? ''),
      total: num(r.total),
      network: num(r.network),
      js: num(r.js)
    }))
  }

  // Ошибки по доменам: домен = префикс события (`domain.action`), агрегируем на клиенте.
  async function getErrorsByDomain(start?: string, end?: string): Promise<DomainErrorRow[]> {
    const query = 'level:error | stats by (_msg) count() c | sort by (c desc)'
    const text = await run({ endpoint: 'query', query, start, end })
    const byDomain = new Map<string, number>()
    for (const r of parseNdjson<Record<string, unknown>>(text)) {
      const event = String(r._msg ?? '')
      if (!event) continue
      const domain = event.split('.')[0]
      byDomain.set(domain, (byDomain.get(domain) ?? 0) + num(r.c))
    }
    return [...byDomain.entries()]
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
  }

  // Топ падающих событий с доминирующим уровнем (для бейджа).
  async function getTopErrors(start?: string, end?: string, limit = 10): Promise<TopErrorRow[]> {
    const query = '* | stats by (_msg, level) count() c | sort by (c desc)'
    const text = await run({ endpoint: 'query', query, start, end })
    // Агрегируем сумму по событию и запоминаем уровень с наибольшим количеством.
    const acc = new Map<string, { count: number; level: string; levelCount: number }>()
    for (const r of parseNdjson<Record<string, unknown>>(text)) {
      const event = String(r._msg ?? '')
      if (!event) continue
      const level = String(r.level ?? '')
      const c = num(r.c)
      const cur = acc.get(event)
      if (!cur) {
        acc.set(event, { count: c, level, levelCount: c })
      } else {
        cur.count += c
        if (c > cur.levelCount) {
          cur.level = level
          cur.levelCount = c
        }
      }
    }
    return [...acc.entries()]
      .map(([event, v]) => ({ event, count: v.count, level: v.level }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Последние события (Live tail) — скользящее окно 5 минут.
  async function getLiveTail(filters: Partial<LogFilters>, limit = 100): Promise<LogEvent[]> {
    const expr = buildFilterExpr(filters)
    const head = ['_time:5m', expr].filter(Boolean).join(' ')
    const query = `${head} | sort by (_time desc) | limit ${limit}`
    const text = await run({ endpoint: 'query', query, limit })
    return parseNdjson<LogEvent>(text)
  }

  // Полная хронология сессии (client + server).
  async function getSessionTrace(sessionId: string): Promise<LogEvent[]> {
    const query = `sessionId:${ql(sessionId)} | sort by (_time)`
    const text = await run({ endpoint: 'query', query })
    return parseNdjson<LogEvent>(text)
  }

  return {
    run,
    parseNdjson,
    getOverviewCounters,
    getKpiSeries,
    getErrorRate,
    getErrorsByDomain,
    getTopErrors,
    getLiveTail,
    getSessionTrace
  }
}
