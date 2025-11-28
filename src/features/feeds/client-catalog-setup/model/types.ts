export interface SubjectItem {
  id: number
  name: string
  code: string
  inn: string
  taemail: string
}

export interface CategoryItem {
  id: number
  name: string
  parent_id: number
  vid: string
  isChecked: boolean
  child: Omit<CategoryItem, 'child'>[]
}

export interface BrandItem {
  brend: string
  priceType: string
  discount: number
}

export type CategoryId = number

export type BrandsFilter = Record<CategoryId, BrandItem[]>

export interface ManagerItem {
  name: string
  state: string
  email: string
}
