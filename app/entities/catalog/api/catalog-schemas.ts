export interface GetCatalogItemDto {
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
  vids: string[]
}

export type DownloadTemplateOption = 'all' | 'full' | 'empty'

export interface PresetFilter {
  name: string
  minLimit: string
  maxLimit: string
  minSelect: string
  maxSelect: string
  selected: string
}

export interface PresetItem {
  id: number
  catalogItemId: number
  title: string
  descr: string
  shortDescr: string
  presets: PresetFilter[]
  alias: string
  location: 'top' | 'bottom' | 'top-bottom' | 'hidden'
  image: {
    uid: string
    path: string
    name: string
    fileType: string
    docType: string
  } | null
  variantVisible: string
  // variant: string // small | medium | large
}

export interface GetPresetsFilters {
  catalogItemId: number
  catalogItemVid: string
  catalogItemName: string
  presets: PresetItem[]
}

export interface CharFilterItem {
  nn: number
  name: string
  qtyRecords: number
}

export interface CharFilter {
  nn: number
  name: string
  typeValue: string
  isNumeric: boolean
  minLimit: string
  maxLimit: string
  minSelect: string
  maxSelect: string
  selected: string
  isSelected: boolean
  items: CharFilterItem[]
}

export interface GetPresetFiltersByCatalogItemRes {
  presets: PresetItem[]
  charFilters: CharFilter[]
}

export interface SavePresetFilterItem {
  // Для новой подфильтровой страницы бэк ждёт id = 0
  id: number
  catalogItemId: number
  title: string
  descr?: string
  shortDescr?: string
  presets: { name: string; selected: string; minSelect: string; maxSelect: string }[]
  alias: string
  location: 'top' | 'bottom' | 'top-bottom' | 'hidden'
  image?: File
}

export interface GetCatalogVidsItemRes {
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
