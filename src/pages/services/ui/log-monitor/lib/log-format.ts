import type { LogLevel } from '~/entities/services'

type TagType = 'default' | 'error' | 'warning' | 'info' | 'success'

// Цвет тега для уровня события.
export function levelTagType(level?: string): TagType {
  switch (level) {
    case 'error':
      return 'error'
    case 'warn':
      return 'warning'
    case 'info':
      return 'info'
    case 'debug':
      return 'default'
    default:
      return 'default'
  }
}

export function sourceTagType(source?: string): TagType {
  return source === 'server' ? 'warning' : 'success'
}

// Цвет бейджа HTTP-статуса: 5xx — красный, 429/4xx — янтарный, прочее — серый.
export function statusTagType(status: number): TagType {
  if (status >= 500) return 'error'
  if (status === 429 || status === 401) return 'warning'
  return 'default'
}

// Относительное «сколько назад» для колонки «Посл.»: «30 сек», «4 мин», «2 ч».
export function formatAgo(value?: string | null): string {
  if (!value) return '—'
  const t = new Date(value).getTime()
  if (Number.isNaN(t)) return '—'
  const sec = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (sec < 60) return `${sec} сек`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} мин`
  const hours = Math.round(min / 60)
  if (hours < 24) return `${hours} ч`
  return `${Math.round(hours / 24)} дн`
}

// Читаемое время «дд.мм чч:мм:сс» из ISO/строки.
export function formatTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function isErrorLevel(level?: string): boolean {
  return level === 'error'
}

// Контекст события в строку «key=value key=value» для колонки CTX.
// Поля контекста приходят из VictoriaLogs плоскими ключами с префиксом `ctx.`
// (ctx.viewport, ctx.message, …), а не вложенным объектом `ctx`.
export function formatCtx(event?: Record<string, unknown> | null): string {
  if (!event || typeof event !== 'object') return ''
  return Object.entries(event)
    .filter(([k]) => k.startsWith('ctx.'))
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      const key = k.slice(4)
      return `${key}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`
    })
    .join(' ')
}

// Число с разрядами через неразрывный пробел: 1284 → «1 284».
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}

// Короткое время «чч:мм» для плотной оси X графика.
export function formatShortTime(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export { type LogLevel }
