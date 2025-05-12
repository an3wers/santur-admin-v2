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
    url: string
  }
  gimg: string
  child: Omit<CatalogItem, 'child'>[]
}
