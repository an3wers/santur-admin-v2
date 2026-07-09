import type {
  LogEvent,
  LogFilters,
  LogQueryParams,
  ErrorRatePoint,
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
  if (filters.eventPrefix) parts.push(`event:${ql(filters.eventPrefix)}*`)
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
      'count() if (event:"network.error") network, ' +
      'count() if (event:"checkout.payment.failed") payments'
    const text = await run({ endpoint: 'query', query, start, end })
    const row = parseNdjson<Record<string, unknown>>(text)[0] ?? {}
    return {
      errors: num(row.errors),
      network: num(row.network),
      payments: num(row.payments)
    }
  }

  // Error rate по 5-минутным бакетам для line-chart.
  async function getErrorRate(start?: string, end?: string): Promise<ErrorRatePoint[]> {
    const query = 'level:error | stats by (_time:5m) count() c | sort by (_time)'
    const text = await run({ endpoint: 'query', query, start, end })
    return parseNdjson<Record<string, unknown>>(text).map((r) => ({
      time: String(r._time ?? ''),
      count: num(r.c)
    }))
  }

  // Топ падающих событий.
  async function getTopErrors(start?: string, end?: string, limit = 10): Promise<TopErrorRow[]> {
    const query = `level:error | stats by (event) count() c | sort by (c desc) | limit ${limit}`
    const text = await run({ endpoint: 'query', query, start, end, limit })
    return parseNdjson<Record<string, unknown>>(text).map((r) => ({
      event: String(r.event ?? ''),
      count: num(r.c)
    }))
  }

  // Последние события (Live tail) — скользящее окно 5 минут.
  async function getLiveTail(filters: Partial<LogFilters>, limit = 100): Promise<LogEvent[]> {
    const expr = buildFilterExpr(filters)
    const head = ['_time:5m', expr].filter(Boolean).join(' ')
    const query = `${head} | sort by (serverTs desc) | limit ${limit}`
    const text = await run({ endpoint: 'query', query, limit })
    return parseNdjson<LogEvent>(text)
  }

  // Полная хронология сессии (client + server).
  async function getSessionTrace(sessionId: string): Promise<LogEvent[]> {
    const query = `sessionId:${ql(sessionId)} | sort by (serverTs)`
    const text = await run({ endpoint: 'query', query })
    return parseNdjson<LogEvent>(text)
  }

  return {
    run,
    parseNdjson,
    getOverviewCounters,
    getErrorRate,
    getTopErrors,
    getLiveTail,
    getSessionTrace
  }
}
