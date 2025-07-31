export interface ExportConstructorDto {
  excludedCategories: number[]
  excludedBrends: string[]
  znaks: {
    znak: string
    incash: boolean
    price: boolean
    selected: boolean
  }[]
}

export interface FilterKeyDto {
  key: string
  title: string
  descr: string
}
