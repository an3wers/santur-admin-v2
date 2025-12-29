export interface GetPostsReq {
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
  extFields: ExtFieldsValue[] | null
}

export interface PostsResp {
  totalPages: number
  items: PostListItem[]
  currentPage: number
  pageSize: number
  totalCount: number
}

export interface ExtFields {
  id: number
  title: string
}

export interface ExtFieldsValue extends ExtFields {
  extFieldId: number
  value: string
}

export interface PostDetailResp {
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
  status: string // "" or "published"
  extFields: ExtFieldsValue[] | null
  order: number
  previewImgUrl: string
}

export interface SavePostReq {
  id: number
  title: string
  alias: string
  descr: string
  content: string
  categoryId: number
  date: string // example: 26.06.2023
  extFields: ExtFields[]
  published: 'Y' | 'N'
  previewImage?: File
  previewImgUrl: string
}
