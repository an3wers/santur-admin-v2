<script setup lang="ts">
import { NSpace, NP, NH4, NTable, NTabs, NTabPane } from 'naive-ui'

import type { ReportClientSalesDto } from '../../api/analytics-schemas'
import { formatCurrency } from '~/shared/libs/format-currency'

const { deatils } = defineProps<{
  deatils: ReportClientSalesDto | null
}>()
</script>

<template>
  <n-space vertical size="large">
    <div v-if="!deatils" class="placeholder"></div>
    <template v-else>
      <div class="detail-header">
        <n-p>Период: {{ deatils.leftDate }} - {{ deatils.rightDate }}</n-p>
        <n-p>Менеджер: {{ deatils.ta }}</n-p>
      </div>

      <n-tabs type="line" animated>
        <n-tab-pane name="brand" tab="Бренды">
          <div class="detail-brands">
            <n-h4>Бренды</n-h4>
            <div v-if="!deatils.brends.length" style="text-align: center; padding: 1rem">
              <n-p>Нет данных за выбранный период</n-p>
            </div>
            <n-table v-else :single-line="false">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th class="currency">Сумма</th>
                  <th class="currency">Сумма завершенных</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in deatils.brends" :key="b.title">
                  <td>{{ b.title }}</td>
                  <td width="160" class="currency">{{ formatCurrency(b.sumAll) }}</td>
                  <td width="170" class="currency">{{ formatCurrency(b.sumRealized) }}</td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </n-tab-pane>
        <n-tab-pane name="tks" tab="Товарные категории">
          <div class="detail-category">
            <n-h4>Товарные категории</n-h4>
            <div v-if="!deatils.tks.length" style="text-align: center; padding: 1rem">
              <n-p>Нет данных за выбранный период</n-p>
            </div>

            <n-table v-else :single-line="false">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th class="currency">Сумма</th>
                  <th class="currency">Сумма завершенных</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tk in deatils.tks" :key="tk.title">
                  <td>{{ tk.title }}</td>
                  <td width="160" class="currency">{{ formatCurrency(tk.sumAll) }}</td>
                  <td width="170" class="currency">{{ formatCurrency(tk.sumRealized) }}</td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </n-tab-pane>
      </n-tabs>
    </template>
  </n-space>
</template>

<style scoped>
.placeholder {
  height: 100px;
  width: 100%;
}

.detail-brands,
.detail-category {
  margin-top: 16px;
}

.currency {
  text-align: right;
}
</style>
