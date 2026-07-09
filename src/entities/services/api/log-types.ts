// Схема события лога (ТЗ §4). Клиентские и серверные события — одна схема.
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogSource = 'client' | 'server'

export interface LogEvent {
  // Физические поля VictoriaLogs: имя события хранится в `_msg`, метка времени — в `_time`.
  _msg?: string
  _time?: string

  ts: string // ISO 8601, время источника
  level: LogLevel
  event?: string // логическое имя события; в хранилище лежит в `_msg`
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

// Точка тайм-серии error rate (бакеты 5 мин): всего ошибок + разбивка по сериям.
export interface ErrorRatePoint {
  time: string
  total: number
  network: number
  js: number
}

// Точка KPI-тайм-серии (бакеты 1 ч): питает крупные числа и спарклайны карточек.
export interface KpiPoint {
  time: string
  errors: number
  network: number
  order: number
  js: number
}

// Строка панели «Ошибки по доменам» (домен = префикс события).
export interface DomainErrorRow {
  domain: string
  count: number
}

// Строка таблицы «топ ошибок».
export interface TopErrorRow {
  event: string
  count: number
  level: string
}

// Счётчики обзора за период.
export interface OverviewCounters {
  errors: number
  network: number
  order: number
}
