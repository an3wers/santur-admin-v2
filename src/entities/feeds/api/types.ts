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

export interface SearchManagersRes {
  name: string
  state: string
  email: string
}

export interface FilterSubjectRes {
  subjectId: number
  title: string
  descr: string
  finishData: string
  startData: string
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
  startData: string
  finishData: string
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
