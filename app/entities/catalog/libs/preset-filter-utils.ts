import { generateAlias } from '~/shared/libs/generate-alias'
import type { CharFilter, PresetItem, SavePresetFilterItem } from '../api/catalog-schemas'

// Набор отмеченных значений фильтров: имя группы -> отмеченные значения
export type FilterGroups = Record<string, string[]>

/**
 * Порядок групп фильтров в форме: сначала наименование, затем остальные
 * характеристики, бренд — последним. Бэк отдаёт [бренды, наименования, ...остальное].
 */
export function orderCharFilters(charFilters: CharFilter[]): CharFilter[] {
  const [brands, names, ...others] = charFilters

  let filters: CharFilter[] = []

  if (names) {
    filters = filters.concat(names)
  }

  if (others.length) {
    filters = filters.concat(others)
  }

  if (brands) {
    filters = filters.concat(brands)
  }

  return filters
}

// Отмеченные значения в порядке следования групп фильтров
export function collectChecked(charFilters: CharFilter[], groups: FilterGroups): string[] {
  return charFilters.flatMap((cf) => groups[cf.name] ?? [])
}

export function buildPresetTitle(
  categoryName: string,
  checked: string[],
  includeCategory: boolean
): string {
  const prefix = includeCategory ? categoryName : ''
  return [prefix, ...checked].filter(Boolean).join(' ')
}

// Категория всегда участвует в alias, независимо от того, включена ли она в заголовок
export function buildPresetAlias(categoryName: string, checked: string[]): string {
  return generateAlias([categoryName, ...checked].filter(Boolean).join(' '))
}

// Каноничное представление набора отмеченных фильтров (для сравнения на дубликат)
export function canonicalizeSelections(groups: FilterGroups): string {
  return Object.entries(groups)
    .map(([name, values]) => [name, [...values].sort()] as const)
    .filter(([, values]) => values.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, values]) => `${name}=${values.join(',')}`)
    .join(';')
}

export function presetToGroups(preset: PresetItem): FilterGroups {
  const groups: FilterGroups = {}
  preset.presets.forEach((pf) => {
    groups[pf.name] = pf.selected.split(';').filter(Boolean)
  })
  return groups
}

// Часть payload с фильтрами: пустые группы отбрасываем, значения склеиваем через ';'
export function buildPresetsPayload(
  charFilters: CharFilter[],
  groups: FilterGroups
): SavePresetFilterItem['presets'] {
  return charFilters
    .filter((cf) => groups[cf.name]?.length)
    .map((cf) => ({
      name: cf.name,
      selected: groups[cf.name]?.join(';') ?? '',
      minSelect: '',
      maxSelect: ''
    }))
}
