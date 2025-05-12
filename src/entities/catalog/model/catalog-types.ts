export interface CatalogItem {
  id: number
  parent_id: number
  parent_name: string
  vid: string
  name: string
  num: number
  seotitle: string
  keywords: string
  alias: string
  descr: string
  shortDescr: string
  imgExist: boolean
  image: {
    id: number
    mediaType: string
    url: string
  }
  gimg: string | null
  child: Omit<CatalogItem, 'child'>[]
}

export interface CatalogItemModel {
  id: number
  parent_id: number
  parent_name: string
  vid: string
  name: string
  seotitle: string
  keywords: string
  alias: string
  descr: string
  shortDescr: string
  imgExist: boolean
}
