export interface BannersListItem {
  categoryId: number
  categoryName: string
  id: number
  imgPath: string
  link: string
  name: string
  order: number
  regDate: string
}

export interface BannersList {
  totalPages: number
  items: BannersListItem[]
  currentPage: number
  pageSize: number
  totalCount: number
  extendedData?: unknown
}

export interface BannerItem {
  id: number
  imgPath: string
  link: string
  name: string
  order: number
  regDate: string
  nn: number
  categoryId: number
}
