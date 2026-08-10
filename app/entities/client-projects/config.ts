import type { SelectOption } from 'naive-ui'

export const statusOptions: SelectOption[] = [
  { label: 'Новый', value: 'new' },
  { label: 'Подтвержден', value: 'confirmed' },
  { label: 'На доработке', value: 'on_revision' },
  { label: 'Закрыт', value: 'closed' },
  { label: 'Отменен', value: 'canceled' }
]

// const statusOptions: SelectOption[] = [
//   { label: 'Новый' },
//   { label: 'Подтвержден' },
//   { label: 'На доработке' },
//   { label: 'Закрыт' },
//   { label: 'Отменен' }
// ]
