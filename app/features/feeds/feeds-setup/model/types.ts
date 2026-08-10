export interface FeedBrands {
  brends: { id: number; name: string; isChecked: boolean }[]
  letters: { letter: string; qty: number; lng: string }[]
}

export interface FeedCategoryItem {
  id: number
  name: string
  parent_id: number
  vid: string
  isChecked: boolean
  child: Omit<FeedCategoryItem, 'child'>[]
}
