export interface ExtFields {
  id: number
  title: string
  extFieldId: number
  value: string
}

export interface PostItem {
  id: number
  title: string
  alias: string
  descr: string
  content: string
  categoryId: number
  date: string // example: 26.06.2023
  dateTimestamp: number
  extFields: ExtFields[]
  published: boolean
}


export interface PostListItem {
  id: number
  title: string
  alias: string
  description: string
  author: string | null
  regDate: string
  regDateS: string
  isPublished: boolean
  order: number
  categoryId: number
  categoryName: string
  extFields: ExtFields[] | null
}
