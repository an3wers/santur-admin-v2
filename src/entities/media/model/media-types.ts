import type { UploadFileInfo } from 'naive-ui'

export type OptionsType = { file: UploadFileInfo; fileList: Array<UploadFileInfo>; event?: Event }

export interface MediaListItem {
  year: number
  monthNum: number
  month: string
  num: number
  regdate: string
  id: number
  imgPath: string
  fileName: string
  ext: string
  isImg: boolean
}

export interface MediaListType {
  years: number[]
  months: {
    year: number
    monthNum: number
    month: string
  }[]
  selYear: number
  selMonth: number
  files: {
    currentPage: number
    items: MediaListItem[]
    pageSize: number
    totalCount: number
    totalPages: number
  }
}
