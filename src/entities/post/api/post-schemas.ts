export interface GetPostsDto {
  app: string
  categoryId: string | number
  page: string | number
  search: string
  sort: string
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
  extFields: IExtFieldsValue[] | null
}

export interface PostsDto {
  totalPages: number
  items: PostListItem[] // TODO: дотипизировать
  currentPage: number
  pageSize: number
  totalCount: number
}

export interface IExtFields {
  id: number
  title: string
}

export interface IExtFieldsValue extends IExtFields {
  extFieldId: number
  value: string
}

export interface PostDetailDto {
  id: number
  title: string
  description: string
  alias: string
  regDate: string
  regDateS: string
  content: string
  authorId: number
  categoryId: number
  author: string
  status: string
  extFields: IExtFieldsValue[]
  order: number
}

export interface SavePostDto {
  id: number
  title: string
  alias: string
  descr: string
  content: string
  categoryId: number
  date: string // example: 26.06.2023
  extFields: IExtFields[]
  published: 'Y' | 'N'
}
