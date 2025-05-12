import type { GetCatalogItemDto } from '../api/catalog-schemas'
import type { CatalogItem } from '../model/catalog-types'

export const groupCatalogItems = (items: GetCatalogItemDto[]): CatalogItem[] => {
  const firstLevel: CatalogItem[] = items
    .filter((item) => item.parent_id === 0)
    .map((item) => ({ ...item, child: [] }))

  const secondLevel = items.filter((item) => item.parent_id !== 0)

  secondLevel.forEach((item) => {
    const foundParent = firstLevel.find((p) => p.id === item.parent_id)

    if (foundParent) {
      foundParent.child.push(item)
    }
  })

  return firstLevel
}
