import type { CharFilter, PresetItem } from '../api/catalog-schemas'
import {
  buildPresetAlias,
  buildPresetTitle,
  canonicalizeSelections,
  collectChecked,
  presetToGroups,
  type FilterGroups
} from './preset-filter-utils'

export interface BulkPresetRow {
  // Каноничная строка набора фильтров — стабильный ключ строки превью
  key: string
  groups: FilterGroups
  axisValue: string
  title: string
  alias: string
  // «Бренд: Grohe; Диаметр: 15» — для колонки превью
  filtersLabel: string
  // Уже существующая страница с таким же набором фильтров
  duplicateOf: PresetItem | null
  // Alias совпал с более ранней строкой этой же пачки
  aliasCollision: boolean
}

export interface BuildPresetCombinationsParams {
  charFilters: CharFilter[]
  selections: FilterGroups
  axisName: string | null
  categoryName: string
  includeCategoryInTitle: boolean
  existingPresets: PresetItem[]
}

/**
 * Разворачивает отмеченные фильтры в набор страниц: значения группы-оси идут по
 * одному на страницу, все остальные отмеченные фильтры попадают в каждую страницу
 * целиком. Без выбранной оси комбинаций нет.
 */
export function buildPresetCombinations(params: BuildPresetCombinationsParams): BulkPresetRow[] {
  const {
    charFilters,
    selections,
    axisName,
    categoryName,
    includeCategoryInTitle,
    existingPresets
  } = params

  if (!axisName) {
    return []
  }

  const axisFilter = charFilters.find((cf) => cf.name === axisName)
  const axisSelected = selections[axisName] ?? []

  if (!axisFilter || !axisSelected.length) {
    return []
  }

  // Порядок значений оси берём из справочника фильтра, а не из порядка отметок
  const axisValues = axisFilter.items
    .map((item) => item.name)
    .filter((name) => axisSelected.includes(name))

  // Общая часть — все отмеченные значения кроме оси
  const baseGroups: FilterGroups = {}
  charFilters.forEach((cf) => {
    if (cf.name === axisName) {
      return
    }
    const values = selections[cf.name]
    if (values?.length) {
      baseGroups[cf.name] = [...values]
    }
  })

  const existingByCanonical = new Map<string, PresetItem>()
  existingPresets.forEach((preset) => {
    const canonical = canonicalizeSelections(presetToGroups(preset))
    if (canonical && !existingByCanonical.has(canonical)) {
      existingByCanonical.set(canonical, preset)
    }
  })

  const seenAliases = new Set<string>()

  return axisValues.map((axisValue) => {
    const groups: FilterGroups = { ...baseGroups, [axisName]: [axisValue] }
    const checked = collectChecked(charFilters, groups)
    const key = canonicalizeSelections(groups)
    const alias = buildPresetAlias(categoryName, checked)
    const aliasCollision = seenAliases.has(alias)

    seenAliases.add(alias)

    return {
      key,
      groups,
      axisValue,
      title: buildPresetTitle(categoryName, checked, includeCategoryInTitle),
      alias,
      filtersLabel: charFilters
        .filter((cf) => groups[cf.name]?.length)
        .map((cf) => `${cf.name}: ${groups[cf.name]?.join(', ')}`)
        .join('; '),
      duplicateOf: existingByCanonical.get(key) ?? null,
      aliasCollision
    }
  })
}
