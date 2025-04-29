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