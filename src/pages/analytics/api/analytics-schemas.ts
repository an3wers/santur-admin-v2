export interface GetOrdersDto {
  page: number
  period: string
  pageSize: number
  source: string
  search: string
  state: string
}

export interface AnalyticsOrderItem {
  id: number
  orderCode: string
  orderSource: string
  baseSumm: number
  orderSumm: number
  orderState: {
    code: string
    name: string
    title: string
    descr: string
  }
  orderType: string
  paymentMethod: string
  subjectID: number
  subjectName: string
  orderDate: string
}

export interface OrdersDto {
  totalPages: number
  items: AnalyticsOrderItem[]
  currentPage: number
  pageSize: number
  totalCount: number
  extendedData: {
    totals: {
      totalBaseSumm: number
      totalOrderSumm: number
    }
  }
}

export interface GetOrderStatusesDto {
  code: string
  name: string
  title: string
  descr: string
}

export interface GetReportSummaryClientsDto {
  ownerId: 100000 | 100002 | 100005
  leftDate: string
  rightDate: string
}

export interface GetReportClienSalesDto {
  ownerId: 100000 | 100002 | 100005
  subjectId: number
  src: string | 'ecom'
  leftDate: string
  rightDate: string
}

export interface ClientsReport {
  subjectId: number
  subjectName: string
  qtyOrdersSelf: number
  sumOrdersSelf: number
  sumOrdersSelfStr: string
  qtyRealizedOrdersSelf: number
  sumRealizedOrdersSelf: number
  sumRealizedOrdersSelfStr: string
  qtyOrders: number
  sumOrders: number
  sumOrdersStr: string
  qtyRealizedOrders: number
  sumRealizedOrders: number
  sumRealizedOrdersStr: string
  converce: string
  converceSelf: string
}

export interface ReportsSummery {
  qtySubjectsSelf: number
  qtySubjectsSelfStr: string
  qtySubjects: number
  qtySubjectsStr: string
  qtyOrdersSelf: number
  qtyOrdersSelfStr: string
  qtyRealizedOrdersSelf: number
  qtyRealizedOrdersSelfStr: string
  qtyOrders: number
  qtyOrdersStr: string
  qtyRealizedOrders: number
  qtyRealizedOrdersStr: string
  sumOrdersSelf: number
  sumOrdersSelfStr: string
  sumRealizedOrdersSelf: number
  sumRealizedOrdersSelfStr: string
  sumOrders: number
  sumOrdersStr: string
  sumRealizedOrders: number
  sumRealizedOrdersStr: string
  converce: string
  converceSelf: string
}

export interface ReportSummaryClientsDto {
  leftDate: string
  rightDate: string
  leftDateHtml5: string
  rightDateHtml5: string
  report: ClientsReport[]
  summary: ReportsSummery
}

export interface ReportClientSalesDto {
  leftDate: string
  rightDate: string
  client: string
  ta: string
  brends: {
    title: string
    sumAll: number
    sumAllStr: string
    sumRealized: number
    sumRealizedStr: string
  }[]
  tks: {
    title: string
    sumAll: number
    sumAllStr: string
    sumRealized: number
    sumRealizedStr: string
  }[]
}
