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
  subjectId: 100001
  title: 'каталог для 100001'
  descr: ''
  finishData: ''
  startData: ''
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
