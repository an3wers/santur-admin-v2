import type { CatalogItem, CatalogVidsItem } from '../model/catalog-types'

export const attachVidsToCatalog = (
  items: CatalogItem[],
  vids: CatalogVidsItem[]
): CatalogItem[] => {
  // Виды (третий уровень) привязываем к товарным категориям по parent_id
  const vidsByParent = new Map<number, CatalogVidsItem[]>()
  vids.forEach((vid) => {
    const arr = vidsByParent.get(vid.parent_id) ?? []
    arr.push(vid)
    vidsByParent.set(vid.parent_id, arr)
  })

  return items.map((item) => ({
    ...item,
    child: item.child.map((child) => ({
      ...child,
      categoryVids: vidsByParent.get(child.id)
    }))
  }))
}
