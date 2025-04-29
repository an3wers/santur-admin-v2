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
