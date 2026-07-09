// Схема события лога (ТЗ §4). Клиентские и серверные события — одна схема.
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogSource = 'client' | 'server'

export interface LogEvent {
  ts: string // ISO 8601, время источника
  level: LogLevel
  event: string // таксономия domain.action[.result]
  sessionId: string
  url?: string | null
  release?: string
  ctx?: Record<string, unknown>

  // проставляет log-server
  userId?: number | null
  authenticated?: boolean
  ip?: string
  ua?: string
  serverTs?: string
  source?: LogSource

  // прочие поля из VictoriaLogs приходят как есть
  [key: string]: unknown
}

// Эндпоинты VictoriaLogs, разрешённые log-server'ом (ТЗ Ф-2.10).
export type LogQueryEndpoint = 'query' | 'hits' | 'stats_query'

export interface LogQueryParams {
  endpoint: LogQueryEndpoint
  query: string
  start?: string
  end?: string
  limit?: number
}

// Фильтры экрана Live tail (ТЗ 9.2).
export interface LogFilters {
  level: string
  eventPrefix: string
  sessionId: string
  userId: string
  release: string
  source: string
}

// Точка тайм-серии error rate (бакеты 5 мин).
export interface ErrorRatePoint {
  time: string
  count: number
}

// Строка таблицы «топ ошибок».
export interface TopErrorRow {
  event: string
  count: number
}

// Счётчики обзора за период.
export interface OverviewCounters {
  errors: number
  network: number
  payments: number
}
