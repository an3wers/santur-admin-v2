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

// wtf??
// [
// {
//             "subjectId": 973,
//             "brends": [
//                 "[\"Aquasfera\",\"ПК Контур\",\"Wilo\"]"
//             ],
//             "systema": "Отопление, Водопровод, Канализация, Фаянс, Система пожаротушения, ИТП, Холодильный центр, Кондиционирование, Котельная, Вентиляция, НВК, Другая"
//         }
// ]
export interface ClientProjectSettingsRes {
  subjectId: number
  brends: string[]
  systema: string
}
