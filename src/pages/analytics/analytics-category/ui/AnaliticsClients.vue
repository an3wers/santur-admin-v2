<script setup lang="ts">
import {
  NSpace,
  NCard,
  NDatePicker,
  NButton,
  NSelect,
  NDrawer,
  NDrawerContent,
  NSpin,
  NTable,
  NP,
  NCheckbox
} from 'naive-ui'
import { getReportSummaryCliensQueryKey } from '../../api/query-keys'
import { useAnalyticsApi } from '../../api/analytics-api'
import { formatDateForServer } from '~/shared/libs/format-date-for-server'
import type { ReportClientSalesDto } from '../../api/analytics-schemas'
import { fromatCurrency } from '~/shared/libs/format-currency'
import AnalyticsClientDetail from './AnalyticsClientDetail.vue'
import { checkRecomendForSelfOrdering } from '../libs/check-recomend-for-self-ordering'

const range = ref<[number, number]>([Date.now(), Date.now()])
const ownerId = ref<100000 | 100002 | 100005>(100000)

const source = ref<string | 'ecom'>('')

const isSelf = ref('N')

const selfOptions = [
  {
    label: 'Все заказы',
    value: 'N'
  },
  {
    label: 'Сайт',
    value: 'Y'
  }
]

const ownerOptions = [
  {
    label: 'Екатеринбург',
    value: 100000
  },
  {
    label: 'Нижний Тагил',
    value: 100002
  },
  {
    label: 'Пермь',
    value: 100005
  }
]

// type TableColumns = Partial<ClientsReport>

// const columnsAll: DataTableColumns<TableColumns> = [
//   // {
//   //   title: 'ID',
//   //   key: 'subjectId',
//   //   className: 'id-column',
//   //   width: 80,
//   //   fixed: 'left'
//   // },
//   {
//     title: 'Клиент',
//     key: 'subjectName',
//     className: 'name-column',
//     // width: 280,
//     fixed: 'left',
//     render(row) {
//       return h(
//         'span',
//         {
//           style: {
//             cursor: 'pointer'
//           },
//           onClick: () => {
//             openClientDetails(row.subjectId ?? 0)
//           }
//         },
//         row.subjectName
//       )
//     }
//   },
//   {
//     title: 'Заказы',
//     key: 'orders',
//     width: 180,
//     children: [
//       {
//         title: 'Все',
//         key: 'qtyOrders',
//         width: 90
//         // sorter: (row1, row2) => row1.qtyOrders! - row2.qtyOrders!
//       },
//       {
//         title: 'Сайт',
//         key: 'qtyOrdersSelf',
//         width: 90
//       }
//     ]
//   },
//   {
//     title: 'Завершенные заказы',
//     key: 'realizedOrders',
//     width: 180,
//     children: [
//       {
//         title: 'Все',
//         key: 'qtyRealizedOrders',
//         width: 90
//       },
//       {
//         title: 'Сайт',
//         key: 'qtyRealizedOrdersSelf',
//         width: 90
//       }
//     ]
//   },
//   {
//     title: 'Сумма заказов',
//     key: 'sum',
//     className: 'currency-column-group',
//     width: 300,
//     children: [
//       {
//         title: 'Все',
//         key: 'sumOrders',
//         className: 'currency-column',
//         width: 150,
//         render(row) {
//           return h('span', {}, row.sumOrders)
//         }
//       },
//       {
//         title: 'Сайт',
//         key: 'sumOrdersSelf',
//         className: 'currency-column',
//         width: 150,
//         render(row) {
//           return h('span', {}, row.sumOrdersSelf)
//         }
//       }
//     ]
//   },
//   {
//     title: 'Сумма завершенных',
//     key: 'realizes-sum',
//     className: 'currency-column-group',
//     width: 300,
//     children: [
//       {
//         title: 'Все',
//         key: 'sumRealizedOrders',
//         className: 'currency-column',
//         width: 150,
//         render(row) {
//           return h('span', {}, row.sumRealizedOrders)
//         }
//       },
//       {
//         title: 'Сайт',
//         key: 'sumRealizedOrdersSelf',
//         className: 'currency-column',
//         width: 150,
//         render(row) {
//           return h('span', {}, row.sumRealizedOrdersSelf)
//         }
//       }
//     ]
//   }
// ]

// TODO: Доработать колонки
// const columnsSelf: DataTableColumns<TableColumns> = [
//   {
//     title: 'ID',
//     key: 'subjectId'
//   },
//   {
//     title: 'Клиент',
//     key: 'subjectName'
//   },
//   {
//     title: 'Все заказы',
//     key: 'qtyOrdersSelf'
//   },
//   {
//     title: 'Завершенные заказы',
//     key: 'qtyRealizedOrdersSelf'
//   },
//   {
//     title: 'Сумма заказов',
//     key: 'sumOrdersSelf'
//   },
//   {
//     title: 'Сумма завершенных',
//     key: 'sumRealizedOrdersSelf'
//   }
// ]

// const columns = computed(() => {
//   return isSelf.value === 'Y' ? columnsSelf : columnsAll
// })

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
    // transform(payload) {
    //   return {
    //     ...payload,
    //     report: payload.report.map((item) => {
    //       return {
    //         ...item,
    //         sumOrdersSelf: fromatCurrency(item.sumOrdersSelf),
    //         sumOrders: fromatCurrency(item.sumOrders),
    //         sumRealizedOrdersSelf: fromatCurrency(item.sumRealizedOrdersSelf),
    //         sumRealizedOrders: fromatCurrency(item.sumRealizedOrders)
    //       }
    //     })
    //   }
    // },
    watch: [range, ownerId]
  }
)

const searchValue = ref('')
const filteredBySearch = computed(() => {
  if (!dataReposrts.value?.report) return []

  if (searchValue.value === '') return dataReposrts.value.report

  return dataReposrts.value.report.filter((item) => {
    return item.subjectName.toLowerCase().includes(searchValue.value.toLowerCase())
  })
})

const checkedShowRecomend = ref(false)
const filteredByRecomend = computed(() => {
  if (!dataReposrts.value?.report) return []

  if (checkedShowRecomend.value === false) return filteredBySearch.value

  return filteredBySearch.value.filter((item) => {
    return checkRecomendForSelfOrdering(
      item.sumOrders,
      item.sumOrdersSelf,
      item.sumRealizedOrders,
      item.qtyOrders
    )
  })
})

function cleanFilters() {
  range.value = [Date.now(), Date.now()]
  ownerId.value = 100000
}

// const createSummary: DataTableCreateSummary = () => {
//   return {
//     sumRealizedOrdersSelf: {
//       value: h(
//         'span',
//         { class: 'item-summery' },
//         `${fromatCurrency(dataReposrts.value?.summary.sumRealizedOrdersSelf ?? 0)}`
//       )
//     },
//     sumRealizedOrders: {
//       value: h(
//         'span',
//         { class: 'item-summery' },
//         `${fromatCurrency(dataReposrts.value?.summary.sumRealizedOrders ?? 0)}`
//       )
//     },
//     sumOrdersSelf: {
//       value: h(
//         'span',
//         { class: 'item-summery' },
//         `${fromatCurrency(dataReposrts.value?.summary.sumOrdersSelf ?? 0)}`
//       )
//     },
//     sumOrders: {
//       value: h(
//         'span',
//         { class: 'item-summery' },
//         `${fromatCurrency(dataReposrts.value?.summary.sumOrders ?? 0)}`
//       )
//     },
//     qtyRealizedOrdersSelf: {
//       value: h(
//         'span',
//         { class: 'item-summery' },
//         `${dataReposrts.value?.summary.qtyRealizedOrdersSelf}`
//       )
//     },
//     qtyRealizedOrders: {
//       value: h(
//         'span',
//         { class: 'item-summery' },
//         `${dataReposrts.value?.summary.qtyRealizedOrders}`
//       )
//     },
//     qtyOrdersSelf: {
//       value: h('span', { class: 'item-summery' }, `${dataReposrts.value?.summary.qtyOrdersSelf}`)
//     },
//     qtyOrders: {
//       value: h('span', { class: 'item-summery' }, `${dataReposrts.value?.summary.qtyOrders}`)
//     }
//   }
// }

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
// const columnsRef = ref(columnsAll)
// function handleSorterChange(sorter: DataTableSortState) {
//   console.log('@', sorter)

//   columnsRef.value.forEach((column: any) => {
//     if (column.sortOrder === undefined) return
//     if (!sorter) {
//       column.sortOrder = false
//       return
//     }
//     if (column.key === sorter.columnKey) {
//       column.sortOrder = sorter.order
//     } else {
//       column.sortOrder = false
//     }
//   })
// }
</script>

<template>
  <n-space vertical size="large">
    <n-card size="small">
      <n-space vertical>
        <n-space>
          <InputSearch v-model="searchValue" />
          <div style="width: 160px">
            <n-select v-model:value="ownerId" :options="ownerOptions" />
          </div>
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
        <n-space>
          <n-checkbox v-model:checked="checkedShowRecomend">
            Рекомендация перевести на сайт
          </n-checkbox>
        </n-space>
      </n-space>
    </n-card>
    <!-- <n-data-table
      remote
      size="small"
      summary-placement="top"
      :columns="columnsAll"
      :loading="statusReports === 'pending'"
      :data="dataReposrts?.report"
      :bordered="false"
      :max-height="660"
      :summary="createSummary"
    /> -->
    <n-spin :show="statusReports === 'pending'">
      <div v-if="statusReports === 'pending'" style="height: 200px"></div>

      <div
        v-if="statusReports !== 'pending' && !filteredByRecomend.length"
        style="text-align: center; padding: 1rem"
      >
        <n-p>Нет данных за выбранный период</n-p>
      </div>
      <div v-if="statusReports === 'success' && filteredByRecomend.length" class="table-container">
        <n-table
          :bordered="false"
          :theme-overrides="{
            fontSizeSmall: '13px'
          }"
          :single-line="false"
          size="small"
          class="table-el"
        >
          <thead class="table-header">
            <tr>
              <th colspan="1" rowspan="2">Клиент</th>
              <th colspan="2" rowspan="1" width="120">Заказы</th>
              <th colspan="2" rowspan="1">Завершенные заказы</th>
              <th colspan="2" rowspan="1" width="260">Сумма заказов</th>
              <th colspan="2" rowspan="1" width="260">Сумма завершенных</th>
              <th colspan="2" rowspan="1" width="100">Конверсия</th>
            </tr>
            <tr>
              <th colspan="1" rowspan="1">Все</th>
              <th colspan="1" rowspan="1">Сайт</th>
              <th colspan="1" rowspan="1">Все</th>
              <th colspan="1" rowspan="1">Сайт</th>
              <th colspan="1" rowspan="1">Все</th>
              <th colspan="1" rowspan="1">Сайт</th>
              <th colspan="1" rowspan="1">Все</th>
              <th colspan="1" rowspan="1">Сайт</th>
              <th colspan="1" rowspan="1">Все</th>
              <th colspan="1" rowspan="1">Сайт</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in filteredByRecomend"
              :key="r.subjectId"
              :class="{
                'tr-alert': checkRecomendForSelfOrdering(
                  r.sumOrders,
                  r.sumOrdersSelf,
                  r.sumRealizedOrders,
                  r.qtyOrders
                )
              }"
            >
              <td>
                <div @click="openClientDetails(r.subjectId)" class="td-name">
                  {{ r.subjectName }}
                </div>
              </td>
              <td>{{ r.qtyOrders }}</td>
              <td>{{ r.qtyOrdersSelf }}</td>
              <td>{{ r.qtyRealizedOrders }}</td>
              <td>{{ r.qtyRealizedOrdersSelf }}</td>
              <td>{{ fromatCurrency(r.sumOrders) }}</td>
              <td>{{ fromatCurrency(r.sumOrdersSelf) }}</td>
              <td>{{ fromatCurrency(r.sumRealizedOrders) }}</td>
              <td>{{ fromatCurrency(r.sumRealizedOrdersSelf) }}</td>
              <td>{{ r.converce }}</td>
              <td>{{ r.converceSelf }}</td>
            </tr>
            <tr class="table-summery">
              <td><div style="text-align: right">ИТОГО</div></td>
              <td>{{ dataReposrts?.summary.qtyOrders }}</td>
              <td>{{ dataReposrts?.summary.qtyOrdersSelf }}</td>
              <td>{{ dataReposrts?.summary.qtyRealizedOrders }}</td>
              <td>{{ dataReposrts?.summary.qtyRealizedOrdersSelf }}</td>
              <td>{{ fromatCurrency(dataReposrts?.summary.sumOrders ?? 0) }}</td>
              <td>{{ fromatCurrency(dataReposrts?.summary.sumOrdersSelf ?? 0) }}</td>
              <td>{{ fromatCurrency(dataReposrts?.summary.sumRealizedOrders ?? 0) }}</td>
              <td>{{ fromatCurrency(dataReposrts?.summary.sumRealizedOrdersSelf ?? 0) }}</td>
              <td>{{ dataReposrts?.summary.converce }}</td>
              <td>{{ dataReposrts?.summary.converceSelf }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </n-spin>
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
.table-el {
  position: relative;
  height: auto;
  border-collapse: collapse;
  overflow-y: auto;
}

.table-el tr:hover td {
  background-color: rgba(247, 247, 250, 1);
}

.tr-alert td {
  background-color: rgba(255, 0, 0, 0.09);
}

.table-el tr.tr-alert:hover td {
  background-color: rgba(255, 0, 0, 0.09);
}

.table-header {
  position: sticky;
  top: 0;
}

.table-summery {
  position: sticky;
  bottom: 0px;
  font-weight: 900;
}

.td-name {
  cursor: pointer;
}
</style>
