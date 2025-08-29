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
  subjectCode: string
  subjectId: number
  subjectName: string
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
