<script setup lang="ts">
import { NSpace, NP, NH4, NDivider, NTable } from 'naive-ui'

import type { ReportClientSalesDto } from '../../api/analytics-schemas'

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
      <n-divider />
      <div class="detail-brands">
        <n-h4>Бренды</n-h4>
        <n-p v-if="!deatils.brends.length">Нет заказов за выбранный период</n-p>
        <n-table v-else :single-line="false">
          <thead>
            <tr>
              <th>Наименование</th>
              <th>Сумма</th>
              <th>Сумма завершенных</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in deatils.brends" :key="b.title">
              <td>{{ b.title }}</td>
              <td>{{ b.sumAll }}</td>
              <td>{{ b.sumRealized }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <div class="detail-category">
        <n-h4>Товарные категории</n-h4>
      </div>
    </template>
  </n-space>
</template>

<style scoped>
.placeholder {
  height: 100px;
  width: 100%;
}
</style>
