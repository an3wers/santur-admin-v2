import type { CatalogItem } from '../model/catalog-types'
import type { GetPresetsFilters, PresetItem } from '../api/catalog-schemas'

export const attachPresetsToCatalog = (
  items: CatalogItem[],
  presets: GetPresetsFilters[]
): CatalogItem[] => {
  // Подфильтры привязываем только к категориям (tk) по catalogItemId
  const tkPresets = new Map<number, PresetItem[]>()
  presets
    .filter((p) => p.catalogItemVid === 'tk')
    .forEach((p) => tkPresets.set(p.catalogItemId, p.presets))

  return items.map((item) => ({
    ...item,
    child: item.child.map((child) => ({
      ...child,
      presets: tkPresets.get(child.id)
    }))
  }))
}
