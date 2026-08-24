import type { CatalogItem } from '../model/catalog-types'

/** Регистр и различие ё/е не должны мешать поиску по подстроке */
export function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase().replace(/ё/g, 'е')
}

function matchesQuery(query: string, ...fields: (string | number | null | undefined)[]): boolean {
  return fields.some(
    (field) =>
      field !== null && field !== undefined && normalizeSearchValue(String(field)).includes(query)
  )
}

/**
 * Клиентский поиск по структуре каталога: направление -> категория -> вид или
 * подфильтровая страница. Ищем по названию, алиасу и id.
 *
 * Ветку оставляем, если совпал сам элемент или что-то внутри него. Совпадение на
 * верхнем уровне показывает вложенные элементы целиком, иначе внутри остаются
 * только совпавшие виды и подфильтровые страницы.
 */
export function filterCatalogItems(items: CatalogItem[], search: string): CatalogItem[] {
  const query = normalizeSearchValue(search)

  if (!query) {
    return items
  }

  const result: CatalogItem[] = []

  for (const item of items) {
    const itemMatched = matchesQuery(query, item.name, item.alias, item.id)
    const child: CatalogItem['child'] = []

    for (const category of item.child) {
      if (itemMatched || matchesQuery(query, category.name, category.alias, category.id)) {
        child.push(category)
        continue
      }

      const categoryVids = (category.categoryVids ?? []).filter((vid) =>
        matchesQuery(query, vid.name, vid.alias, vid.id)
      )
      const presets = (category.presets ?? []).filter((preset) =>
        matchesQuery(query, preset.title, preset.alias, preset.id)
      )

      if (categoryVids.length || presets.length) {
        child.push({ ...category, categoryVids, presets })
      }
    }

    if (itemMatched || child.length) {
      result.push({ ...item, child })
    }
  }

  return result
}
