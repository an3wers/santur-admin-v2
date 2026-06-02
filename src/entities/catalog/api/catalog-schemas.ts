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
  }
  gimg: string | null
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
}

export interface GetPresetsFilters {
  catalogItemId: number
  catalogItemVid: string
  catalogItemName: string
  presets: PresetItem[]
}
