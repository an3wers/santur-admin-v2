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
