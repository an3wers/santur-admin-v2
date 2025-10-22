export interface ProjectPreview {
  authorId: number
  brands: string
  buyer: string
  catalog: string
  customer: string
  descr: string
  engineeringSystem: string
  id: number
  isDeleted: boolean
  name: string
  regdate: string
  regtime: string
  state: string
  status: string
  statusName: string
  subjectCode: string
  subjectId: number
  subjectName: string
  bonus: number
  cost: number
  qtyComments: number
  qtyFiles: number
  qtyNotreadedComments: number
}

export interface SubjectPreview {
  id: number
  name: string
  qtyProjects: number
  bonusSum: number
  requestedBonusTospend: number
}

export interface ClientProjectDto {
  projects: {
    currentPage: number
    pageSize: number
    qtyRecords: number
    recordsOfCurrentPage: ProjectPreview[]
    totalPages: number
  }
  subjects: SubjectPreview[]
}

export interface ClientProjectsFilters {
  page?: number
  pageSize?: number
  search?: string
  subjectId?: number
  sort?: 'id' | 'id desc' | 'regdate' | 'regdate desc'
  status?: string
  // range?: [number, number]
}

export interface ClientProjectDetailDto {
  id: number
  projectName: string
  projectOrganization: string
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
  statusName: string
  prices: string
  points: string
  bonus: number
  cost: number
  createdAt: string
  files: Array<{
    fileUID: string
    fileName: string
    ext: string | null
    getPath: string
    staticPath: string
  }>
  comments: Array<{
    id: number //100058
    comment: string // 'Ну я посмотрел, заценил. Всё норм'
    authorId: number //100000
    author: string // 'Журавлев Алексей'
    iamAuthor: boolean // false
    iamSeen: boolean // false
    regdate: string // '05.09.2025'
    regtime: string // '0:00'
    regdatetime: string // '05.09.2025 в 0:00'
  }>
}

export interface ClientProjectStatusesDto {
  key: string
  val: string
}

export interface UpdateProjectStateDto {
  id: number
  status: string
  cost: number
  bonus: number
  comment?: string
}

export interface ClientProjectSettingsRes {
  brends: string[]
  systems: string[]
}

export interface GetSpendBonusRes {
  acceptor: string //''
  acceptorId: number // 0
  author: string //'Артем Журавлев'
  authorId: number //  142427
  bonusAll: number //1110
  docId: number //100000
  isAccepted: boolean // false
  isRequest: boolean // true
  payedBonus: number // 0
  payedDate: string // ''
  regdate: string // '10.10.2025 в 15:36'
  requestBonus: number // 100
  state: string // 'ожидание подтверждения'
  stateCode: string // 'N'
  subject: string // 'САНГО'
  subjectId: number // 100001
}
