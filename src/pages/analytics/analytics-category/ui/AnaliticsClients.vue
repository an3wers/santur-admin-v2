<script setup lang="ts">
import {
  NSpace,
  NCard,
  NDatePicker,
  NButton,
  NDataTable,
  type DataTableColumns,
  type PaginationInfo,
  NSelect,
  NDrawer,
  NDrawerContent,
  type DataTableCreateSummary,
  NSpin
} from 'naive-ui'
import { getReportSummaryCliensQueryKey } from '../../api/query-keys'
// import { Refresh } from '@vicons/tabler'
import { useAnalyticsApi } from '../../api/analytics-api'
import { formatDateForServer } from '~/shared/libs/format-date-for-server'
import type { ClientsReport, ReportClientSalesDto } from '../../api/analytics-schemas'
import { fromatCurrency, stringToNumber } from '~/shared/libs/format-currency'
import AnalyticsClientDetail from './AnalyticsClientDetail.vue'

const range = ref<[number, number]>([Date.now(), Date.now()])
const ownerId = ref<100000 | 100002 | 100005>(100000)

const source = ref<string | 'ecom'>('')
const owners = []
const isSelf = ref('N')
const selfOptions = [
  {
    label: 'Все заказы',
    value: 'N'
  },
  {
    label: 'Оформлены самостоятельно',
    value: 'Y'
  }
]

type TableColumns = Partial<ClientsReport>

const columnsAll: DataTableColumns<TableColumns> = [
  {
    title: 'ID',
    key: 'subjectId',
    className: 'id-column'
  },
  {
    title: 'Клиент',
    key: 'subjectName',
    className: 'name-column',
    render(row) {
      return h(
        'span',
        {
          style: {
            cursor: 'pointer'
          },
          onClick: () => {
            openClientDetails(row.subjectId ?? 0)
          }
        },
        row.subjectName
      )
    }
  },
  {
    title: 'Заказы',
    key: 'orders',
    children: [
      {
        title: 'Все',
        key: 'qtyOrders'
        // sorter: (row1, row2) => row1.qtyOrders! - row2.qtyOrders!
      },
      {
        title: 'Cамост.',
        key: 'qtyOrdersSelf'
      }
    ]
  },
  {
    title: 'Завершенные заказы',
    key: 'realizedOrders',
    children: [
      {
        title: 'Все',
        key: 'qtyRealizedOrders'
      },
      {
        title: 'Cамост.',
        key: 'qtyRealizedOrdersSelf'
      }
    ]
  },
  {
    title: 'Сумма заказов',
    key: 'sum',
    className: 'currency-column-group',
    children: [
      {
        title: 'Все',
        key: 'sumOrders',
        className: 'currency-column',
        render(row) {
          return h('span', {}, row.sumOrders)
        }
      },
      {
        title: 'Cамост.',
        key: 'sumOrdersSelf',
        className: 'currency-column',
        render(row) {
          return h('span', {}, row.sumOrdersSelf)
        }
      }
    ]
  },
  {
    title: 'Сумма завершенных',
    key: 'realizes-sum',
    className: 'currency-column-group',
    children: [
      {
        title: 'Все',
        key: 'sumRealizedOrders',
        className: 'currency-column',
        render(row) {
          return h('span', {}, row.sumRealizedOrders)
        }
      },
      {
        title: 'Cамост.',
        key: 'sumRealizedOrdersSelf',
        className: 'currency-column',
        render(row) {
          return h('span', {}, row.sumRealizedOrdersSelf)
        }
      }
    ]
  }
]

const columnsSelf: DataTableColumns<TableColumns> = [
  {
    title: 'ID',
    key: 'subjectId'
  },
  {
    title: 'Клиент',
    key: 'subjectName'
  },
  {
    title: 'Все заказы',
    key: 'qtyOrdersSelf'
  },
  {
    title: 'Завершенные заказы',
    key: 'qtyRealizedOrdersSelf'
  },
  {
    title: 'Сумма заказов',
    key: 'sumOrdersSelf'
  },
  {
    title: 'Сумма завершенных',
    key: 'sumRealizedOrdersSelf'
  }
]

const columns = computed(() => {
  return isSelf.value === 'Y' ? columnsSelf : columnsAll
})

// const pagination = reactive({
//   page: 1,
//   pageSize: 20,
//   showSizePicker: true,
//   pageSizes: [20, 40, 60],
//   pageCount: 1,
//   itemCount: 1,
//   prefix: ({ itemCount }: PaginationInfo) => {
//     return `Количество: ${itemCount}.`
//   }
// })
const api = useAnalyticsApi()
const { data: dataReposrts, status: statusReports } = useAsyncData(
  getReportSummaryCliensQueryKey(),
  () =>
    api.getReportSummaryClients({
      ownerId: ownerId.value,
      leftDate: formatDateForServer(new Date(range.value[0])),
      rightDate: formatDateForServer(new Date(range.value[1]))
    }),
  {
    transform(payload) {
      return {
        ...payload,
        report: payload.report.map((item) => {
          return {
            ...item,
            sumOrdersSelf: fromatCurrency(item.sumOrdersSelf),
            sumOrders: fromatCurrency(item.sumOrders),
            sumRealizedOrdersSelf: fromatCurrency(item.sumRealizedOrdersSelf),
            sumRealizedOrders: fromatCurrency(item.sumRealizedOrders)
          }
        })
      }
    },
    watch: [range, ownerId]
  }
)

function cleanFilters() {
  range.value = [Date.now(), Date.now()]
  ownerId.value = 100000
}
const createSummary: DataTableCreateSummary = () => {
  return {
    sumRealizedOrdersSelf: {
      value: h(
        'span',
        { class: 'item-summery' },
        `${fromatCurrency(dataReposrts.value?.summary.sumRealizedOrdersSelf ?? 0)}`
      )
    },
    sumRealizedOrders: {
      value: h(
        'span',
        { class: 'item-summery' },
        `${fromatCurrency(dataReposrts.value?.summary.sumRealizedOrders ?? 0)}`
      )
    },
    sumOrdersSelf: {
      value: h(
        'span',
        { class: 'item-summery' },
        `${fromatCurrency(dataReposrts.value?.summary.sumOrdersSelf ?? 0)}`
      )
    },
    sumOrders: {
      value: h(
        'span',
        { class: 'item-summery' },
        `${fromatCurrency(dataReposrts.value?.summary.sumOrders ?? 0)}`
      )
    },
    qtyRealizedOrdersSelf: {
      value: h(
        'span',
        { class: 'item-summery' },
        `${dataReposrts.value?.summary.qtyRealizedOrdersSelf}`
      )
    },
    qtyRealizedOrders: {
      value: h(
        'span',
        { class: 'item-summery' },
        `${dataReposrts.value?.summary.qtyRealizedOrders}`
      )
    },
    qtyOrdersSelf: {
      value: h('span', { class: 'item-summery' }, `${dataReposrts.value?.summary.qtyOrdersSelf}`)
    },
    qtyOrders: {
      value: h('span', { class: 'item-summery' }, `${dataReposrts.value?.summary.qtyOrders}`)
    }
  }
}

const isOpenClientDetails = ref(false)

function openClientDetails(subjectId: number) {
  isOpenClientDetails.value = true
  getClientDetails(subjectId)
}

const clientDetails = ref<ReportClientSalesDto | null>(null)
const clietnDetailStatus = ref<ProcessStatus>('idle')
async function getClientDetails(subjectId: number) {
  try {
    clietnDetailStatus.value = 'pending'
    const res = await api.getReportClienSales({
      leftDate: formatDateForServer(new Date(range.value[0])),
      rightDate: formatDateForServer(new Date(range.value[1])),
      ownerId: ownerId.value,
      subjectId: subjectId,
      src: source.value
    })
    clientDetails.value = res
    clietnDetailStatus.value = 'success'
  } catch (error) {
    console.error(error)
    clietnDetailStatus.value = 'error'
  }
}
</script>

<template>
  <n-space vertical size="large">
    <n-card size="small">
      <n-space>
        <!-- <div style="width: 160px">
          <n-select v-model:value="source" :options="sourceOptions" />
        </div> -->
        <!-- <div style="width: 200px">
          <n-select v-model:value="isSelf" :options="selfOptions" />
        </div> -->
        <div style="width: 280px">
          <n-date-picker v-model:value="range" type="daterange" format="dd-MM-yyyy" />
        </div>

        <!-- <n-button @click="saveExcelHandler">
          <template #icon>
            <n-icon>
              <Download />
            </n-icon>
          </template>
          Excel
        </n-button> -->
        <!-- <n-button @click="() => refreshOrders()">
          <template #icon>
            <n-icon>
              <Refresh />
            </n-icon>
          </template>
        </n-button> -->
        <n-button quaternary @click="cleanFilters">Сбросить</n-button>
      </n-space>
    </n-card>
    <n-data-table
      remote
      size="small"
      summary-placement="top"
      :columns="columns"
      :loading="statusReports === 'pending'"
      :data="dataReposrts?.report"
      :bordered="false"
      :max-height="680"
      :summary="createSummary"
    />
    <n-drawer v-model:show="isOpenClientDetails" :width="800">
      <n-drawer-content :title="clientDetails?.client ?? ''" closable>
        <n-spin :show="clietnDetailStatus === 'pending'">
          <AnalyticsClientDetail :deatils="clientDetails" />
        </n-spin>
      </n-drawer-content>
    </n-drawer>
  </n-space>
</template>

<style scoped>
:deep(.id-column) {
  width: 100px;
}

:deep(.name-column) {
  width: 280px;
}

:deep(.name-column) > span {
  display: block;
}

:deep(.currency-column-group) {
  width: 300px;
}

:deep(.currency-column) {
  width: 150px;
}

:deep(td.currency-column) > * {
  white-space: nowrap;
  display: block;
  text-align: right;
}

:deep(.item-summery) {
  font-weight: 600;
}
</style>
