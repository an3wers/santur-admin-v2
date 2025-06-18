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
  NCheckbox,
  NModal,
  NIcon
} from 'naive-ui'
import { getReportSummaryCliensQueryKey } from '../../api/query-keys'
import { useAnalyticsApi } from '../../api/analytics-api'
import { formatDateForServer } from '~/shared/libs/format-date-for-server'
import type { ReportClientSalesDto } from '../../api/analytics-schemas'
import { formatCurrency } from '~/shared/libs/format-currency'
import AnalyticsClientDetail from './AnalyticsClientDetail.vue'
import { checkRecomendForSelfOrdering } from '../libs/check-recomend-for-self-ordering'
import AnalyticsClientDownloadReport from './AnalyticsClientDownloadReport.vue'
import { Download } from '@vicons/tabler'

const isShowDownloadReport = ref(false)

const range = ref<[number, number]>([Date.now(), Date.now()])
const ownerId = ref<100000 | 100002 | 100005>(100000)
const source = ref<string | 'ecom'>('')

const makeOrders = ref<'ta:site' | 'ta' | 'site'>('ta:site')

const makeOrdersOptions = [
  {
    label: '1C (ТА), Сайт',
    value: 'ta:site'
  },
  {
    label: '1C (ТА)',
    value: 'ta'
  },
  {
    label: 'Сайт',
    value: 'site'
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
  source.value = ''
  makeOrders.value = 'ta:site'
  checkedShowRecomend.value = false
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
      <n-space vertical size="large">
        <n-space>
          <div style="width: 200px">
            <InputSearch v-model="searchValue" />
          </div>
          <div style="width: 160px">
            <n-select v-model:value="ownerId" :options="ownerOptions" />
          </div>
          <div style="width: 200px">
            <n-select v-model:value="makeOrders" :options="makeOrdersOptions" />
          </div>
          <div style="width: 280px">
            <n-date-picker
              v-model:value="range"
              type="daterange"
              format="dd-MM-yyyy"
              :first-day-of-week="0"
            />
          </div>

          <n-button @click="isShowDownloadReport = true">
            <template #icon>
              <n-icon>
                <Download />
              </n-icon>
            </template>
            Excel
          </n-button>
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
              <th :colspan="makeOrders === 'ta:site' ? 2 : 1" rowspan="1" width="120">Заказы</th>
              <th :colspan="makeOrders === 'ta:site' ? 2 : 1" rowspan="1">Завершенные заказы</th>
              <th :colspan="makeOrders === 'ta:site' ? 2 : 1" rowspan="1" width="260">
                Сумма заказов
              </th>
              <th :colspan="makeOrders === 'ta:site' ? 2 : 1" rowspan="1" width="260">
                Сумма завершенных
              </th>
              <th :colspan="makeOrders === 'ta:site' ? 2 : 1" rowspan="1" width="100">Конверсия</th>
            </tr>
            <tr>
              <th v-if="makeOrders !== 'site'" colspan="1" rowspan="1">1С (ТА)</th>
              <th v-if="makeOrders !== 'ta'" colspan="1" rowspan="1">Сайт</th>
              <th v-if="makeOrders !== 'site'" colspan="1" rowspan="1">1С (ТА)</th>
              <th v-if="makeOrders !== 'ta'" colspan="1" rowspan="1">Сайт</th>
              <th v-if="makeOrders !== 'site'" colspan="1" rowspan="1">1С (ТА)</th>
              <th v-if="makeOrders !== 'ta'" colspan="1" rowspan="1">Сайт</th>
              <th v-if="makeOrders !== 'site'" colspan="1" rowspan="1">1С (ТА)</th>
              <th v-if="makeOrders !== 'ta'" colspan="1" rowspan="1">Сайт</th>
              <th v-if="makeOrders !== 'site'" colspan="1" rowspan="1">1С (ТА)</th>
              <th v-if="makeOrders !== 'ta'" colspan="1" rowspan="1">Сайт</th>
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
                  {{ r.subjectName == '' ? 'Без названия' : r.subjectName }}
                </div>
              </td>
              <td v-if="makeOrders !== 'site'">{{ r.qtyOrdersTa }}</td>
              <td v-if="makeOrders !== 'ta'">{{ r.qtyOrdersSelf }}</td>
              <td v-if="makeOrders !== 'site'">
                {{ r.qtyRealizedOrdersTa }}
              </td>
              <td v-if="makeOrders !== 'ta'">{{ r.qtyRealizedOrdersSelf }}</td>
              <td v-if="makeOrders !== 'site'">{{ formatCurrency(r.sumOrdersTa) }}</td>
              <td v-if="makeOrders !== 'ta'">{{ formatCurrency(r.sumOrdersSelf) }}</td>
              <td v-if="makeOrders !== 'site'">{{ formatCurrency(r.sumRealizedOrdersTa) }}</td>
              <td v-if="makeOrders !== 'ta'">{{ formatCurrency(r.sumRealizedOrdersSelf) }}</td>
              <td v-if="makeOrders !== 'site'">{{ Number(r.converceTa).toFixed(2) }}%</td>
              <td v-if="makeOrders !== 'ta'">{{ Number(r.converceSelf).toFixed(2) }}%</td>
            </tr>
            <tr class="table-summery">
              <td><div style="text-align: right">ИТОГО</div></td>
              <td v-if="makeOrders !== 'site'">{{ dataReposrts?.summary.qtyOrdersTa }}</td>
              <td v-if="makeOrders !== 'ta'">{{ dataReposrts?.summary.qtyOrdersSelf }}</td>
              <td v-if="makeOrders !== 'site'">{{ dataReposrts?.summary.qtyRealizedOrdersTa }}</td>
              <td v-if="makeOrders !== 'ta'">{{ dataReposrts?.summary.qtyRealizedOrdersSelf }}</td>
              <td v-if="makeOrders !== 'site'">
                {{ formatCurrency(dataReposrts?.summary.sumOrdersTa ?? 0) }}
              </td>
              <td v-if="makeOrders !== 'ta'">
                {{ formatCurrency(dataReposrts?.summary.sumOrdersSelf ?? 0) }}
              </td>
              <td v-if="makeOrders !== 'site'">
                {{ formatCurrency(dataReposrts?.summary.sumRealizedOrdersTa ?? 0) }}
              </td>
              <td v-if="makeOrders !== 'ta'">
                {{ formatCurrency(dataReposrts?.summary.sumRealizedOrdersSelf ?? 0) }}
              </td>
              <td v-if="makeOrders !== 'site'">
                {{ Number(dataReposrts?.summary.converceTa ?? 0).toFixed(2) }}%
              </td>
              <td v-if="makeOrders !== 'ta'">
                {{ Number(dataReposrts?.summary.converceSelf ?? 0).toFixed(2) }}%
              </td>
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
    <n-modal
      style="width: 100%; max-width: 480px"
      :show="isShowDownloadReport"
      preset="dialog"
      title="Отчет по клиентам"
      :show-icon="false"
      @esc="isShowDownloadReport = false"
      @close="isShowDownloadReport = false"
    >
      <AnalyticsClientDownloadReport :owner-id="ownerId" :range="range" :owners="ownerOptions" />
    </n-modal>
  </n-space>
</template>

<style scoped>
.table-container {
  /* overflow-x: auto; */
}

.table-el {
  position: relative;
  height: auto;
  border-collapse: collapse;
  overflow-y: auto;
  /* min-width: 1024px; */
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
