import type { PresetItem } from '../api/catalog-schemas'

export type PresetLocation = PresetItem['location']

// Расположение подфильтровой страницы относительно списка товаров
export const locationMap = new Map<string, string>([
  ['top', 'Над товарами'],
  ['bottom', 'Под товарами'],
  ['top-bottom', 'Над и под товарами'],
  ['hidden', 'Не показывать']
])

export function getLocationLabel(location: string | null | undefined): string {
  if (!location) {
    return 'Не задано'
  }

  return locationMap.get(location) ?? location
}
