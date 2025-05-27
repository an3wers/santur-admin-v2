import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type {
  GetOrdersDto,
  GetOrderStatusesDto,
  GetReportClienSalesDto,
  GetReportSummaryClientsDto,
  OrdersDto,
  ReportClientSalesDto,
  ReportSummaryClientsDto
} from './analytics-schemas'

export const useAnalyticsApi = () => {
  const { fetchWithToken, checkError, baseFetch } = useAppRequest()

  async function getOrders(options: GetOrdersDto) {
    const { page, pageSize, period, source, search, state } = options

    const query = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      period,
      source,
      search,
      state
    })

    const res = await fetchWithToken<OrdersDto>(`Admin/GetStatistics?${query.toString()}`)
    return checkError(res).data
  }

  async function getOrdersStatuses() {
    const res = await fetchWithToken<GetOrderStatusesDto[]>('Admin/GetOrderStatuses')
    return checkError(res).data
  }

  async function getOrdersToExcel(options: Pick<GetOrdersDto, 'period' | 'source' | 'state'>) {
    const query = new URLSearchParams(options)
    const res = await fetchWithToken(`Admin/GetStatisticsAsExcel?${query.toString()}`)
    return checkError(res).data
  }

  async function getReportSummaryClients(options: GetReportSummaryClientsDto) {
    const { leftDate, ownerId, rightDate } = options

    const query = new URLSearchParams({
      leftDate,
      rightDate,
      ownerId: String(ownerId)
    })

    const res = await baseFetch<ReportSummaryClientsDto>(
      `apissz/ReportSummaryCliens?${query.toString()}`
    )

    if (typeof res === 'string') {
      return checkError(JSON.parse(res)).data as ReportSummaryClientsDto
    }

    return checkError(res).data
  }

  async function getReportClienSales(options: GetReportClienSalesDto) {
    const { leftDate, ownerId, rightDate, src, subjectId } = options
    const query = new URLSearchParams({
      leftDate,
      ownerId: String(ownerId),
      rightDate,
      src,
      subjectId: String(subjectId)
    })
    const res = await baseFetch<ReportClientSalesDto>(`apissz/ReportClienSales?${query.toString()}`)
    return checkError(res).data
  }

  // apiSSZ/ReportSummaryCliensAsExcel?leftdate=...&rightdate=...
  async function getReportSummaryClientsToExcel(options: GetReportSummaryClientsDto) {
    const { leftDate, ownerId, rightDate } = options

    const query = new URLSearchParams({
      leftDate,
      rightDate,
      ownerId: String(ownerId)
    })

    const res = await baseFetch<Blob>(`apissz/ReportSummaryCliensAsExcel?${query.toString()}`)
    return checkError(res).data
  }

  return {
    getOrders,
    getOrdersStatuses,
    getOrdersToExcel,
    getReportSummaryClients,
    getReportClienSales,
    getReportSummaryClientsToExcel
  }
}
