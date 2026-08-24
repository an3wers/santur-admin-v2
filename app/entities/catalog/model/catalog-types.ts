import type { PresetFilter, PresetItem } from '../api/catalog-schemas'

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
    uid: string
    path: string
    name: string
    fileType: string
    docType: string
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
  num: number
  seotitle: string
  keywords: string
  alias: string
  descr: string
  shortDescr: string
  imgExist: boolean
  imgUrl: string
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
    uid: string
    path: string
    name: string
    fileType: string
    docType: string
  } | null
  gimg: string
  vids: string[]
  isNl: boolean | null
  isAcc: boolean | null
  isMC: boolean | null
  isForOwner: boolean | null
}

/**
 * Элемент третьего уровня каталога: вид товара или подфильтровая страница.
 * id вида и id подфильтровой страницы могут совпадать, поэтому для ключей
 * и состояния выбора используем `key` вида `${kind}-${id}`.
 */
export type CatalogNode =
  | {
      kind: 'vid'
      key: string
      id: number
      name: string
      alias: string
      raw: CatalogVidsItem
    }
  | {
      kind: 'preset'
      key: string
      id: number
      name: string
      alias: string
      location: PresetItem['location']
      filters: PresetFilter[]
      raw: PresetItem
    }
