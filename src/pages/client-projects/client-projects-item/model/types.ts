export interface ClientProjectDetail {
  id: number
  projectName: string
  engineeringSystem: string
  region: string
  city: string
  street: string
  houseNumber: string
  expectedMonth: string
  expectedYear: string
  customerName: string
  customerRegion: string
  customerCity: string
  customerStreet: string
  customerHouseNumber: string
  customerContactPerson: string
  customerContactPosition: string
  customerEmail: string
  customerPhone: string
  customerMobilePhone: string
  buyerName: string
  buyerRegion: string
  buyerCity: string
  buyerStreet: string
  buyerHouseNumber: string
  buyerContactPerson: string
  buyerContactPosition: string
  buyerEmail: string
  buyerPhone: string
  buyerMobilePhone: string
  brands: string[]
  status: string
  prices: string
  price: number
  points: string
  point: number
  createdAt: string
  files: Array<{
    fileUID: string
    fileName: string
    ext: string | null
    getPath: string
    staticPath: string
  }>
}
