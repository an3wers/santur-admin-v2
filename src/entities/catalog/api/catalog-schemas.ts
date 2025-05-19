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
