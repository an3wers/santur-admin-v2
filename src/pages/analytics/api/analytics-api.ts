import { useAppRequest } from "~/shared/libs/api/use-app-requests"
import type { GetOrdersDto, GetOrderStatusesDto, OrdersDto } from "./analytics-schemas"

export const useAnalyticsApi = () => {
    const { fetchWithToken, checkError } = useAppRequest()

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

    return { getOrders, getOrdersStatuses, getOrdersToExcel }
}