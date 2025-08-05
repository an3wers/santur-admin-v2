export interface CatalogItem {
  id: number
  name: string
  parent_id: number
  vid: string
  isChecked: boolean
  child: Omit<CatalogItem, 'child'>[]
}

export interface BrandsData {
  brends: { id: number; name: string; published: boolean; isChecked: boolean }[]
  letters: { letter: string; qty: number; lng: string }[]
}
