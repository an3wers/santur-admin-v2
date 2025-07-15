export interface CatalogItem {
  id: number
  name: string
  parent_id: number
  vid: string
  isChecked: boolean
  child: Omit<CatalogItem, 'child'>[]
}
