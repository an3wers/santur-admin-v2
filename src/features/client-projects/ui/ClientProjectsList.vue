<script setup lang="ts">
import {
  NSpace,
  NCard,
  NSpin,
  NTable,
  NPagination,
  useMessage,
  NIcon,
  NText,
  NTabs,
  NTab,
  NButton,
  NModal
} from 'naive-ui'
import {
  ClientProjectsStatusesSelector,
  ClientProjectsStatusesTag,
  getClientProjectsQueryKey,
  useClientProjectsApi,
  useStatuses
} from '~/entities/client-projects'
import { Message2, Paperclip } from '@vicons/tabler'
import { formatNumberWithDigits } from '~/shared/libs/format-number-with-digits'
import { useSpendBonusModal } from '../model/use-spend-bonus-modal'
import ClientProjectSpendBonusContainer from './ClientProjectSpendBonus/ClientProjectSpendBonusContainer.vue'

const tableMode = ref<'projects' | 'clients'>('projects')

// TODO: Вынести в composable
// list pagination
const page = ref(1)
const pageSize = ref(0)
const qtyRecords = ref(0)
const pageCount = ref(0)

// filters
const search = ref('')

const status = ref('')

const sort = ref<'id' | 'id desc' | 'regdate' | 'regdate desc'>('regdate desc')

// const statusOptions = [
//   {
//     label: 'Все статусы',
//     value: ''
//   },
//   ...statusOptionsDefault
// ]

// const range = ref<[number, number]>([Date.now(), Date.now()])

const { data: statusesData, status: statusesStatus } = useStatuses()

const statusOptions = computed(() => {
  const emptyStatus = {
    label: 'Все статусы',
    value: '',
    color: {
      light: '',
      dark: '',
      marker: ''
    }
  }
  if (statusesData.value) {
    return [
      {
        label: 'Все статусы',
        value: '',
        color: {
          light: '#EEEEEE',
          dark: '#EEEEEE',
          marker: '#9E9E9E'
        }
      },
      ...statusesData.value
    ]
  }
  return [emptyStatus]
})

const { getClientProjects } = useClientProjectsApi()
const { data: clientProjectsData, status: clientProjectsStatus } = useAsyncData(
  getClientProjectsQueryKey(),
  () =>
    getClientProjects({
      page: page.value,
      search: search.value,
      sort: sort.value
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

const { setCurrentSubject, isOpenSpendBonus, toggleSpendBonus, currentSubject } =
  useSpendBonusModal()

const openSpendBonus = (subject: {
  id: number
  name: string
  bonusSum: number
  requestedBonusTospend: number
}) => {
  setCurrentSubject(subject)
  toggleSpendBonus()
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
            <n-space>
              <InputSearch v-model="search" placeholder="Поиск" />
              <div style="width: 200px">
                <ClientProjectsStatusesSelector
                  v-model:status="status"
                  :async-status="statusesStatus"
                  :status-options="statusOptions as any"
                />
              </div>
            </n-space>
            <n-tabs v-model:value="tableMode" type="segment">
              <n-tab name="projects"> <span style="padding: 0 14px">Проекты </span></n-tab>
              <n-tab name="clients"> <span style="padding: 0 14px">Клиенты</span> </n-tab>
            </n-tabs>
          </n-space>
          <template v-if="tableMode === 'projects'">
            <div
              v-if="
                clientProjectsStatus === 'success' &&
                !clientProjectsData?.projects.recordsOfCurrentPage.length
              "
              style="text-align: center; padding: 1rem"
            >
              <n-text>Нет данных</n-text>
            </div>

            <div v-if="clientProjectsData?.projects.recordsOfCurrentPage.length" class="table-wrap">
              <div class="table-container">
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
                      <th width="80">Номер</th>
                      <th width="280">Проект</th>
                      <th>Система</th>
                      <th>Компания/ Проектировщик</th>
                      <th>Статус</th>
                      <th width="100">Дата создания</th>
                      <th class="nums-cell" width="110">Сумма</th>
                      <th class="nums-cell" width="90">Баллы</th>
                      <th width="60">
                        <n-icon size="24">
                          <Message2 />
                        </n-icon>
                      </th>
                      <th width="60">
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
                      <td>
                        <ClientProjectsStatusesTag
                          v-if="r.statusName"
                          :status-key="r.status"
                          :status-label="r.statusName"
                        />
                      </td>
                      <td>{{ r.regdate }}, {{ r.regtime }}</td>
                      <td class="nums-cell">{{ formatNumberWithDigits(r.cost) }}</td>
                      <td class="nums-cell">{{ formatNumberWithDigits(r.bonus) }}</td>
                      <td>
                        <span class="msgs-cell">
                          <n-icon size="18">
                            <Message2 />
                          </n-icon>
                          {{ r.qtyComments }}
                        </span>
                      </td>
                      <td>
                        <span class="files-cell">
                          <n-icon size="18">
                            <Paperclip />
                          </n-icon>
                          {{ r.qtyFiles }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </div>
            </div>

            <div class="projects-pagination">
              <NPagination v-model:page="page" :page-count="pageCount" />
            </div>
          </template>
          <template v-if="tableMode === 'clients'">
            <div class="table-contaier">
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
                    <th>Клиент</th>
                    <th width="140">Количество проектов</th>
                    <th width="140">Баллы</th>
                    <th width="280">Запрошено на списание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in clientProjectsData?.subjects" :key="r.id">
                    <td>{{ r.name }}</td>
                    <td>{{ r.qtyProjects }}</td>
                    <td>
                      <div>
                        {{ r.bonusSum }}
                      </div>
                    </td>
                    <td>
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          gap: 0.25rem;
                        "
                      >
                        <span>{{ r.requestedBonusTospend }}</span>
                        <n-button
                          size="tiny"
                          type="primary"
                          @click="
                            openSpendBonus({
                              id: r.id,
                              name: r.name,
                              bonusSum: r.bonusSum,
                              requestedBonusTospend: r.requestedBonusTospend
                            })
                          "
                        >
                          <!-- <template #icon>
                            <n-icon>
                              <BellRinging />
                            </n-icon>
                          </template> -->
                          Списать баллы
                        </n-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </n-table>
            </div>
          </template>
        </n-space>
      </n-card>
    </template>

    <n-modal
      v-model:show="isOpenSpendBonus"
      preset="card"
      size="medium"
      style="max-width: 520px"
      title="Баллы"
      :bordered="false"
      @close="toggleSpendBonus"
      @esc="toggleSpendBonus"
    >
      <ClientProjectSpendBonusContainer :subject="currentSubject" />
    </n-modal>
  </n-space>
</template>

<style scoped>
.projects-pagination {
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}

.table-wrap {
  overflow-x: auto;
}

.table-container {
  /* overflow-x: auto; */
  min-width: 1260px;
  width: 100%;
}

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

.nums-cell {
  text-align: right;
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
