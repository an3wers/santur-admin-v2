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
  taemail: string
}
