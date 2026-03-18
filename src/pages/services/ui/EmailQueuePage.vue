<script setup lang="ts">
import {
  NTable,
  NButton,
  NSpace,
  NTag,
  NEmpty,
  NCard,
  NStatistic,
  NGrid,
  NGi,
  NSpin
} from 'naive-ui'
import { useEmailQueueApi } from '~/entities/services'

const api = useEmailQueueApi()
//const data = await api.getEmailQueue()

const { data, status, refresh } = await useAsyncData('email-queue', () => api.getEmailQueue(), {})

const queueData = computed(() => data.value ?? { queye: [], errors: [] })
</script>

<template>
  <div class="email-queue-container">
    <!-- Статистика -->
    <n-grid :x-gap="12" :cols="3" class="stats-grid">
      <n-gi>
        <n-card class="stat-card">
          <n-statistic label="В очереди" :value="data?.queye.length ?? 0">
            <template #suffix> писем </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card">
          <n-statistic label="С ошибками" :value="data?.errors.length ?? 0">
            <template #suffix> писем </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card">
          <n-statistic label="Всего" :value="queueData.queye.length + queueData.errors.length">
            <template #suffix> писем </template>
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Кнопки действий -->
    <n-space class="action-buttons" justify="space-between" align="center">
      <h2 class="section-title">Управление очередью писем</h2>
      <n-space>
        <n-button type="success" strong secondary @click="refresh()">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"
              />
            </svg>
          </template>
          обновить очередь
        </n-button>
        <n-button type="warning" strong secondary @click="api.repeatSendErrors">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17.65 6.35A8 8 0 0 0 12 4a8 8 0 0 0-8 8a8 8 0 0 0 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18a6 6 0 0 1-6-6a6 6 0 0 1 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              />
            </svg>
          </template>
          Повторно отправить ошибочные
        </n-button>
        <n-button type="error" strong secondary @click="api.clearErrorMessagesStack">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
          </template>
          Очистить очередь ошибок
        </n-button>
      </n-space>
    </n-space>

    <!-- Таблица очереди -->
    <div v-if="status === 'pending'"><n-spin class="spinner"> </n-spin></div>
    <div v-else>
      <n-card title="Текущая очередь" size="small" class="queue-card">
        <n-table :single-line="false" class="email-table">
          <thead>
            <tr>
              <th>GUID</th>
              <th>Вложения</th>
              <th>Название</th>
              <th>Получатель</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!queueData.queye.length" class="empty-row">
              <td colspan="5">
                <n-empty description="В очереди нет писем" />
              </td>
            </tr>
            <tr v-for="item in queueData.queye" :key="item.msgGuid" class="queue-row">
              <td class="guid-cell">{{ item.msgGuid }}</td>
              <td>
                <n-tag :bordered="false" type="info" size="small">
                  {{ item.files.length }} {{ item.files.length === 1 ? 'файл' : 'файлов' }}
                </n-tag>
              </td>
              <td>{{ item.title }}</td>
              <td>
                <n-tag :bordered="false" type="success" size="small">
                  {{ item.toEmail }}
                </n-tag>
              </td>
              <td>
                <n-button
                  text
                  type="error"
                  size="small"
                  @click="api.removeEmailFromStack(item.msgGuid)"
                >
                  Удалить
                </n-button>
              </td>
            </tr>
          </tbody>
        </n-table>
      </n-card>

      <!-- Таблица ошибок -->
      <n-card title="Письма с ошибками" size="small" class="error-card">
        <n-table :single-line="false" class="email-table">
          <thead>
            <tr>
              <th>GUID</th>
              <th>Вложения</th>
              <th>Название</th>
              <th>Получатель</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!queueData.errors.length" class="empty-row">
              <td colspan="5">
                <n-empty description="Нет писем с ошибками" />
              </td>
            </tr>
            <tr v-for="item in queueData.errors" :key="item.msgGuid" class="error-row">
              <td class="guid-cell">{{ item.msgGuid.slice(0, 8) }}...</td>
              <td>
                <n-tag :bordered="false" type="warning" size="small">
                  {{ item.files.length }} {{ item.files.length === 1 ? 'файл' : 'файлов' }}
                </n-tag>
              </td>
              <td>{{ item.title }}</td>
              <td>
                <n-tag :bordered="false" type="error" size="small">
                  {{ item.toEmail }}
                </n-tag>
              </td>
              <td>
                <n-space>
                  <n-button
                    text
                    type="error"
                    size="small"
                    @click="api.removeEmailFromStack(item.msgGuid)"
                  >
                    Удалить
                  </n-button>
                </n-space>
              </td>
            </tr>
          </tbody>
        </n-table>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.email-queue-container {
  height: 100%;
  margin: 0 auto;
  max-width: 1400px;
  padding: 2rem;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.stats-grid {
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.action-buttons {
  margin-bottom: 2rem;
}

.section-title {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.queue-card,
.error-card {
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.error-card {
  border-left: 4px solid #d03050;
}

.email-table {
  border-radius: 8px;
  overflow: hidden;
}

.email-table th {
  background: #f0f2f5;
  color: #1f2a3a;
  font-weight: 600;
  padding: 12px 16px;
}

.queue-row td {
  background: #ffffff;
  transition: background-color 0.2s;
}

.queue-row:hover td {
  background: #f6f8fa;
}

.error-row td {
  background: #fff2f0;
}

.error-row:hover td {
  background: #ffe6e3;
}

.empty-row td {
  padding: 40px;
  text-align: center;
  background: #fafafa;
}

.guid-cell {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
  color: #666;
}

.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .email-queue-container {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
