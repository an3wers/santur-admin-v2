import type { PostItem } from '~/entities/post'

export interface PostItemModel extends Omit<
  PostItem,
  'author' | 'authorId' | 'order' | 'status' | 'regDate'
> {
  timestamp: number
  published: boolean
}
