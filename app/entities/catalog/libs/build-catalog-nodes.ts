import type { CatalogItem, CatalogNode } from '../model/catalog-types'

/**
 * Плоский список третьего уровня каталога: сначала виды, затем подфильтровые страницы.
 * id вида и id подфильтровой страницы могут совпадать, поэтому ключ собираем из вида и id.
 */
export function buildCatalogNodes(category: Omit<CatalogItem, 'child'> | null): CatalogNode[] {
  if (!category) {
    return []
  }

  const vids = (category.categoryVids ?? []).map<CatalogNode>((vid) => ({
    kind: 'vid',
    key: `vid-${vid.id}`,
    id: vid.id,
    name: vid.name,
    alias: vid.alias,
    raw: vid
  }))

  const presets = (category.presets ?? []).map<CatalogNode>((preset) => ({
    kind: 'preset',
    key: `preset-${preset.id}`,
    id: preset.id,
    name: preset.title,
    alias: preset.alias,
    location: preset.location,
    filters: preset.presets ?? [],
    raw: preset
  }))

  return [...vids, ...presets]
}
