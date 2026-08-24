import type { PresetFilter } from '../api/catalog-schemas'

export const EMPTY_FILTER_VALUE = 'не задано'

/**
 * Человекочитаемое значение фильтра, из которого собрана подфильтровая страница.
 * Отмеченные значения бэк отдаёт строкой через ';' (см. presetToGroups),
 * числовые фильтры — парой minSelect/maxSelect.
 */
export function formatPresetFilterValue(filter: PresetFilter): string {
  const selected = filter.selected
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean)

  if (selected.length) {
    return selected.join(', ')
  }

  const min = filter.minSelect?.trim() ?? ''
  const max = filter.maxSelect?.trim() ?? ''

  if (min && max) {
    return `${min} – ${max}`
  }

  if (min) {
    return `от ${min}`
  }

  if (max) {
    return `до ${max}`
  }

  return EMPTY_FILTER_VALUE
}
