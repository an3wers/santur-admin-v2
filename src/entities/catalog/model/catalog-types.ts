import type { PresetItem } from '../api/catalog-schemas'

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
  } | null
  gimg: string | null
  presets?: PresetItem[]
  categoryVids?: CatalogVidsItem[]
  child: Omit<CatalogItem, 'child'>[]
  vids: string[]
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

export interface CatalogVidsItem {
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
  } | null
  gimg: string
  vids: string[]
  isNl: boolean | null
  isAcc: boolean | null
  isMC: boolean | null
  isForOwner: boolean | null
}
