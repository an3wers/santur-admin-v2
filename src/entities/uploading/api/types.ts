export interface ExportConstructorDto {
  catalog: number[]
  brends: string[]
  znaks: {
    znak: string
    incash: boolean
    price: boolean
    selected: boolean
  }[]
}
