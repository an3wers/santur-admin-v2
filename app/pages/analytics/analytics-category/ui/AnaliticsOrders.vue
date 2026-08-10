<script setup lang="ts">
import {
  NDatePicker,
  NSpace,
  NTable,
  NTag,
  NButton,
  NCard,
  NSelect,
  NIcon,
  NSpin,
  NPagination,
  NModal
} from 'naive-ui'
import { useAnalyticsApi } from '../../api/analytics-api'
import { Refresh, Download } from '@vicons/tabler'
import InputSearch from '@/shared/ui/input-search/InputSearch.vue'
import { formatCurrency } from '@/shared/libs/format-currency'
import {
  getAnalyticsOrdersQueryKey,
  getAnalyticsOrdersStatusesQueryKey
} from '../../api/query-keys'
import { formatRangeDate } from '../libs/format-range-date'
import AnalyticsOrdersDownloadReport from './AnalyticsOrdersDownloadReport.vue'

const isShowDownloadReport = ref(false)

const range = ref<[number, number]>([Date.now(), Date.now()])

const state = ref('')
const search = ref('')
const source = ref('ssz:ekb;santur:ekb')
const page = ref(1)
const pageSize = ref(20)

const api = useAnalyticsApi()

const {
  data,
  status,
  refresh: refreshOrders
} = useAsyncData(
  getAnalyticsOrdersQueryKey(),
  () =>
    api.getOrders({
      page: page.value,
      pageSize: pageSize.value,
      period: formatRangeDate(range.value),
      source: source.value,
      search: search.value,
      state: state.value
    }),
  {
    watch: [page, pageSize, range, source, state],
    lazy: true
  }
)

const { data: statusesListData } = useAsyncData(
  getAnalyticsOrdersStatusesQueryKey(),
  api.getOrdersStatuses,
  {
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
    },
    lazy: true
  }
)

watch(search, () => {
  refreshOrderWithDelay()
})

watchEffect(() => {
  if (data.value) {
    page.value = data.value.currentPage
    pageSize.value = data.value.pageSize
  }
})

async function updateDate(value: [number, number]) {
  range.value = value
}

const sourceOptions = ref([
  {
    label: 'Все источники',
    value: 'ssz:ekb;santur:ekb'
  },
  {
    label: 'santur.ru:ekb',
    value: 'santur:ekb'
  },
  {
    label: 'ССЗ:ekb',
    value: 'ssz:ekb'
  }
])

function refreshOrdersWithSearch() {
  refreshOrders()
}

const refreshOrderWithDelay = useDebounceFn(refreshOrdersWithSearch, 600)

function cleanFilters() {
  state.value = ''
  source.value = 'ssz:ekb;santur:ekb'
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
          <!-- v-model:value="range" -->
          <n-date-picker
            :value="range"
            type="daterange"
            format="dd-MM-yyyy"
            :first-day-of-week="0"
            @update:value="updateDate"
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

    <n-spin :show="status === 'pending'">
      <div v-if="status === 'pending' && !data" style="height: 200px"></div>

      <div v-if="data" class="table-container">
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
              <th>Номер заказа</th>
              <th>Дата</th>
              <th>Источник</th>
              <th>Статус</th>
              <th>Способ оплаты</th>
              <th>Контрагент</th>
              <th class="col-sum">Сумма</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in data?.items" :key="r.id">
              <td width="140">
                <div>{{ r.id }}</div>
                {{ r.orderCode }}
              </td>
              <td width="120">
                <div>{{ r.orderDate.split(' ')[0] }}</div>
                {{ r.orderDate.split(' ')[1] }}
              </td>
              <td>{{ r.orderSource }}</td>
              <td>
                <n-tag>{{ r.orderState.name }}</n-tag>
              </td>
              <td>{{ r.paymentMethod }}</td>
              <td>{{ r.subjectName }}</td>
              <td class="col-sum" width="160">{{ formatCurrency(r.orderSumm) }}</td>
            </tr>
            <tr class="table-summery">
              <td colspan="5"></td>
              <td>Кол-во заказов: {{ data?.totalCount }}</td>
              <td class="col-sum">
                {{ formatCurrency(data?.extendedData.totals.totalOrderSumm ?? 0) }}
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <div class="orders-pagination">
        <n-pagination v-model:page="page" :page-count="data?.totalPages" />
      </div>
    </n-spin>
    <n-modal
      style="width: 100%; max-width: 480px"
      preset="dialog"
      title="Отчет по заказам"
      :show="isShowDownloadReport"
      :show-icon="false"
      @esc="isShowDownloadReport = false"
      @close="isShowDownloadReport = false"
    >
      <AnalyticsOrdersDownloadReport
        :range="range"
        :source="source"
        :state="state"
        :source-options="sourceOptions"
        :statuses-options="statusesListData ?? []"
      />
      <!-- <AnalyticsClientDownloadReport :owner-id="ownerId" :range="range" :owners="ownerOptions" /> -->
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

.table-el .col-sum {
  text-align: right;
}

.table-summery {
  position: sticky;
  bottom: 0px;
  font-weight: 900;
}

.orders-pagination {
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}
</style>
