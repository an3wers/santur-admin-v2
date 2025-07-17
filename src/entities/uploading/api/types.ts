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
