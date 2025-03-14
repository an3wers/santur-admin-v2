interface ExtendField {
  id: number
  title: string
}

export interface Category {
  alias: string
  app: string
  id: number
  name: string
  type: number
  menuOrder: number
  extFields: ExtendField[]
}
