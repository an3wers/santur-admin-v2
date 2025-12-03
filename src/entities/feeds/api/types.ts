export interface FeedFilterReq {
  excludedCategories: number[]
  excludedBrends: string[]
  title: string
  descr: string
  znaks: {
    znak: string
    incash: boolean
    price: boolean
    selected: boolean
  }[]
}

export interface FeedFilterRes {
  excludedCategories: number[]
  excludedBrends: string[]
  title: string
  descr: string
  isStrong: boolean
  znaks: {
    znak: string
    incash: boolean
    price: boolean
    selected: boolean
  }[]
}

export interface FeedKeyRes {
  key: string
  title: string
  descr: string
}

export interface SearchSubjectRes {
  id: number
  name: string
  code: string
  inn: string
  ta: string
  taemail: string
}

export interface SearchManagersRes {
  name: string
  state: string
  email: string
}

export interface FilterSubjectRes {
  subjectId: number
  title: string
  descr: string
  finishDate: string
  startDate: string
  isStrong?: boolean
  categories: {
    id: number
    title: string
    brends: {
      brend: string
      priceType: string
      discount: number
    }[]
  }[]
}

export interface SaveFilterSubjectReq {
  subjectId: number
  title: string
  descr: string
  startDate: string
  finishDate: string
  isStrong?: boolean
  categories: {
    id: number
    title: string
    brends: {
      brend: string
      priceType: string
      discount: number
    }[]
  }[]
}

export interface FilterSubjectKeyRes {
  key: string
  title: string
  descr: string
  startDate: string
  finishDate: string
  subject: SearchSubjectRes
}

export interface GetCatalogRes {
  id: number
  name: string
  parent_id: number
  vid: string
  selectedTks: {
    id: number
    name: string
    parent_id: number
    vid: string
  }[]
  selectedTksQty: number
  selectedBrends: string
  selectedBrendsQty: number
}
