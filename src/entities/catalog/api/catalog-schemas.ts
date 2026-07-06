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
    id: number
    mediaType: string
    url: string
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

  // TODO:
  location?: 'top' | 'bottom' | 'both'
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
  id?: number
  catalogItemId: number
  title: string
  descr: string
  shortDescr: string
  presets: { name: string; selected: string; minSelect: string; maxSelect: string }[]
  alias: string

  // TODO:
  location?: 'top' | 'bottom' | 'both'
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
