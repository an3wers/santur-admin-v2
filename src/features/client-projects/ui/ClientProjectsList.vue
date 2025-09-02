<script setup lang="ts">
import {
  NDatePicker,
  NSelect,
  NSpace,
  NCard,
  NSpin,
  NTable,
  NPagination,
  useMessage,
  NIcon,
  NText
} from 'naive-ui'
import { getClientProjectsQueryKey, useClientProjectsApi } from '~/entities/client-projects'
import { statusOptions as statusOptionsDefault } from '@/entities/client-projects'
import { Message2, Paperclip } from '@vicons/tabler'

// TODO: Вынести в composable
// list pagination
const page = ref(1)
const pageSize = ref(0)
const qtyRecords = ref(0)
const pageCount = ref(0)

// filters
const search = ref('')
const status = ref('Все статусы')
const statusOptions = [
  {
    label: 'Все статусы',
    value: ''
  },
  ...statusOptionsDefault
]

const range = ref<[number, number]>([Date.now(), Date.now()])

const { getClientProjects } = useClientProjectsApi()
const { data: clientProjectsData, status: clientProjectsStatus } = useAsyncData(
  getClientProjectsQueryKey(),
  () =>
    getClientProjects({
      page: page.value,
      search: search.value
    }),
  {
    lazy: true,
    watch: [page, search, status]
  }
)

watch(clientProjectsData, () => {
  page.value = clientProjectsData.value?.projects.currentPage || 1
  pageSize.value = clientProjectsData.value?.projects.pageSize || 0
  qtyRecords.value = clientProjectsData.value?.projects.qtyRecords || 0
  pageCount.value = clientProjectsData.value?.projects.totalPages || 0
})

const message = useMessage()

watch(clientProjectsStatus, () => {
  if (clientProjectsStatus.value === 'error') {
    message.error('Произошла ошибка при загрузке проектов')
  }
})

const updateDate = (value: any) => {
  console.log(value)
}
</script>

<template>
  <n-space vertical size="large">
    <n-spin
      v-if="clientProjectsStatus === 'pending' && !clientProjectsData"
      :show="clientProjectsStatus === 'pending'"
    >
      <div style="height: 200px"></div>
    </n-spin>

    <template v-else>
      <n-card size="small">
        <n-space vertical size="large">
          <n-space>
            <InputSearch v-model="search" placeholder="Поиск" />
            <!-- <div style="width: 160px">
          <n-select v-model:value="source" :options="sourceOptions" />
        </div> -->
            <div style="width: 200px">
              <n-select v-model:value="status" :options="statusOptions" />
            </div>
            <!-- <div style="width: 280px">
              <n-date-picker
                :value="range"
                type="daterange"
                format="dd-MM-yyyy"
                :first-day-of-week="0"
                @update:value="updateDate"
              />
            </div> -->
          </n-space>

          <div
            v-if="
              clientProjectsStatus === 'success' &&
              !clientProjectsData?.projects.recordsOfCurrentPage.length
            "
            style="text-align: center; padding: 1rem"
          >
            <n-text>Нет данных</n-text>
          </div>

          <div
            v-if="clientProjectsData?.projects.recordsOfCurrentPage.length"
            class="table-container"
          >
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
                  <th>Номер</th>
                  <th width="280">Проект</th>
                  <th>Система</th>
                  <th>Компания/ Проектировщик</th>
                  <th>Статус</th>
                  <th>Дата создания</th>
                  <th>Сумма</th>
                  <th>Баллы</th>
                  <th>
                    <n-icon size="24">
                      <Message2 />
                    </n-icon>
                  </th>
                  <th>
                    <n-icon size="24">
                      <Paperclip />
                    </n-icon>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in clientProjectsData?.projects.recordsOfCurrentPage" :key="r.id">
                  <td>{{ r.id }}</td>
                  <td>
                    <nuxt-link :to="`/client-projects/${r.id}`">{{ r.name }}</nuxt-link>
                  </td>
                  <td>{{ r.engineeringSystem }}</td>
                  <td>{{ r.subjectName }}</td>
                  <td>{{ r.status }}</td>
                  <td>{{ r.regdate }}, {{ r.regtime }}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    <span class="msgs-cell">
                      <n-icon size="18">
                        <Message2 />
                      </n-icon>
                      0
                    </span>
                  </td>
                  <td>
                    <span class="files-cell">
                      <n-icon size="18">
                        <Paperclip />
                      </n-icon>
                      0
                    </span>
                  </td>
                </tr>
              </tbody>
            </n-table>
            <div class="projects-pagination">
              <NPagination v-model:page="page" :page-count="pageCount" />
            </div>
            <!-- TODO: add pagination -->
          </div>
        </n-space>
      </n-card>
    </template>
  </n-space>
</template>

<style scoped>
.projects-pagination {
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}

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

.msgs-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.files-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
