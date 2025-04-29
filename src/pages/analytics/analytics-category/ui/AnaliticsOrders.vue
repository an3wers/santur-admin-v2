<script setup lang="ts">
import type { DataTableColumns, DataTableCreateSummary, PaginationInfo } from 'naive-ui'
import { NDatePicker, NSpace, NDataTable, NTag, NButton, NCard, NSelect, NIcon } from 'naive-ui'
import { useAnalyticsApi } from '../../api/analytics-api'
import { Refresh, Download } from '@vicons/tabler'
import InputSearch from '@/shared/ui/input-search/InputSearch.vue'
import { fromatCurrency } from '@/shared/libs/format-currency'

const range = ref<[number, number]>([Date.now(), Date.now()])

const state = ref('')
const search = ref('')
const source = ref('ssz:ekb;santur:ekb;santur:tagil;ssz:tagil;ssz:perm;santur:perm')
// const source = ref([
//   'ssz:ekb',
//   'santur:ekb',
//   'santur:tagil',
//   'ssz:tagil',
//   'ssz:perm',
//   'santur:perm'
// ])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [20, 40, 60],
  pageCount: 1,
  itemCount: 1,
  prefix: ({ itemCount }: PaginationInfo) => {
    return `Количество: ${itemCount}.`
  }
})

type Orders = {
  orderNumber: [number, string] | [number]
  orderSource: string
  orderSumm: string
  orderState: string
  paymentMethod: string
  orderDate: string
  subjectInfo: [number, string]
}

const columns: DataTableColumns<Orders> = [
  {
    title: 'Номер заказа',
    key: 'orderNumber',
    className: 'order-number',
    render(row) {
      return [
        h('span', { class: 'small-item' }, row.orderNumber[0]),
        h('span', {}, row.orderNumber[1])
      ]
    }
  },
  {
    title: 'Дата',
    key: 'orderDate'
  },
  {
    title: 'Источник',
    key: 'orderSource'
  },
  {
    title: 'Статус',
    key: 'orderState',
    render(row) {
      return h(NTag, {}, row.orderState)
    }
  },
  {
    title: 'Способ оплаты',
    key: 'paymentMethod'
  },
  {
    title: 'Контрагент',
    key: 'subjectName',
    render(row) {
      return [
        h('span', { class: 'small-item' }, row.subjectInfo[0]),
        h('span', {}, row.subjectInfo[1])
      ]
    },
    className: 'subject-info'
  },
  {
    title: 'Сумма',
    key: 'orderSumm',
    className: 'order-summ'
  }
]

const createPeriod = (dates: [number, number]): string => {
  return dates
    .map((el) => {
      const curr = new Date(el)

      const y = curr.getFullYear()
      const m = curr.getMonth() + 1
      const d = curr.getDate()

      return `${y}${m < 10 ? '0' + m : m}${d < 10 ? '0' + d : d}`
    })
    .join(':')
}

const api = useAnalyticsApi()

const {
  data,
  status,
  refresh: refreshOrders
} = await useAsyncData(
  'analyticsOrdes',
  () =>
    api.getOrders({
      page: pagination.page,
      pageSize: pagination.pageSize,
      period: createPeriod(range.value),
      source: source.value,
      search: search.value,
      state: state.value
    }),
  {
    transform(payload) {
      const { items, ...other } = payload
      const modifiedItems: Orders[] = items.map((el) => {
        return {
          orderNumber: el.orderCode ? [el.id, el.orderCode] : [el.id],
          orderDate: el.orderDate.split(' ')[0],
          orderSource: el.orderSource,
          orderState: el.orderState.name || '-',
          orderSumm: fromatCurrency(el.orderSumm ?? 0),
          paymentMethod: el.paymentMethod,
          subjectInfo: [el.subjectID, el.subjectName]
        }
      })
      return { ...other, items: modifiedItems }
    },
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    },
    watch: [() => pagination.page, () => pagination.pageSize, range, source, state]
  }
)

const { data: statusesListData } = await useAsyncData('analyticsStatuses', api.getOrdersStatuses, {
  transform(data) {
    const mapped = data.map((el) => {
      if (el.code === 'X') {
        return { label: 'Отменен (пользователем)', value: el.code }
      }
      return { label: el.name, value: el.code }
    })

    return [
      {
        label: 'Все статусы',
        value: ''
      },
      ...mapped
    ]
  },
  getCachedData(key, nuxtApp) {
    return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  }
})

watch(search, () => {
  refreshOrderWithDelay()
})

watchEffect(() => {
  if (data.value) {
    pagination.pageCount = data.value.totalPages
    pagination.page = data.value.currentPage
    pagination.pageSize = data.value.pageSize
    pagination.itemCount = data.value.totalCount
  }
})

function updateCurrentPage(page: number) {
  pagination.page = page
}

function updatePageSize(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
}

async function updateDate() {
  // TODO: Реализовать фильтрацию по дате?
}

const sourceOptions = ref([
  {
    label: 'Все источники',
    value: 'ssz:ekb;santur:ekb;santur:tagil;ssz:tagil;ssz:perm;santur:perm'
  },
  {
    label: 'santur.ru:ekb',
    value: 'santur:ekb'
  },
  {
    label: 'santur.ru:tagil',
    value: 'santur:tagil'
  },
  {
    label: 'santur.ru:perm',
    value: 'santur:perm'
  },
  {
    label: 'ССЗ:ekb',
    value: 'ssz:ekb'
  },
  {
    label: 'ССЗ:tagil',
    value: 'ssz:tagil'
  },
  {
    label: 'ССЗ:perm',
    value: 'ssz:perm'
  }
])

const createSummary: DataTableCreateSummary = () => {
  return {
    orderSumm: {
      value: h(
        'span',
        { style: { fontWeight: 'bold' } },
        `${data.value?.totalCount} заказ(ов) на сумму ${fromatCurrency(data.value?.extendedData.totals.totalOrderSumm ?? 0)}`
      ),
      colSpan: 1
    }
  }
}

async function saveExcelHandler() {
  try {
    const res = (await api.getOrdersToExcel({
      period: createPeriod(range.value),
      source: source.value,
      state: state.value
    })) as Blob | undefined

    if (res && res instanceof Blob) {
      const url = URL.createObjectURL(res)

      const a = document.createElement('a')
      a.href = url
      a.download = `orders_${Date.now()}.xlsx`
      a.click()

      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error(error)
  }
}

function refreshOrdersWithSearch() {
  refreshOrders()
}

const refreshOrderWithDelay = useDebounceFn(refreshOrdersWithSearch, 600)

function cleanFilters() {
  state.value = ''
  source.value = 'ssz:ekb;santur:ekb;santur:tagil;ssz:tagil;ssz:perm;santur:perm'
  range.value = [Date.now(), Date.now()]
}
</script>

<template>
  <n-space vertical size="large">
    <n-card size="small">
      <n-space>
        <InputSearch v-model="search" placeholder="Поиск по номеру" />
        <div style="width: 160px">
          <n-select v-model:value="source" :options="sourceOptions" />
        </div>
        <div style="width: 200px">
          <n-select v-model:value="state" :options="statusesListData ?? []" />
        </div>
        <div style="width: 280px">
          <n-date-picker
            v-model:value="range"
            type="daterange"
            format="dd-MM-yyyy"
            @update:value="updateDate"
          />
        </div>

        <n-button @click="saveExcelHandler">
          <template #icon>
            <n-icon>
              <Download />
            </n-icon>
          </template>
          Excel
        </n-button>
        <n-button @click="() => refreshOrders()">
          <template #icon>
            <n-icon>
              <Refresh />
            </n-icon>
          </template>
        </n-button>
        <n-button quaternary @click="cleanFilters">Сбросить</n-button>
      </n-space>
    </n-card>

    <n-data-table
      remote
      size="small"
      summary-placement="top"
      :columns="columns"
      :loading="status === 'pending'"
      :data="data?.items"
      :bordered="false"
      :pagination="pagination"
      :summary="createSummary"
      @update:page="updateCurrentPage"
      @update:page-size="updatePageSize"
    />
  </n-space>
</template>

<style scoped>
:deep(.order-summ) {
  /* color: rgba(0, 128, 0, 0.75);*/

  white-space: nowrap;
  text-align: right;
}

:deep(.subject-info) > * {
  display: block;
}

:deep(.order-number) > * {
  display: block;
}

:deep(.small-item) {
  font-size: 12px;
}
</style>
