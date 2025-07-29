<script setup lang="ts">
import { NCard, NTable, NCheckbox } from 'naive-ui'
import type { ExportConstructorDto } from '~/entities/uploading'

const model = defineModel<ExportConstructorDto['znaks']>('state', { required: true })
</script>

<template>
  <n-card title="Значки">
    <n-table :bordered="false" size="small">
      <thead>
        <tr>
          <th>Значок</th>
          <th>В наличии</th>
          <th>С ценой</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in model" :key="item.znak">
          <td>
            <n-checkbox v-model:checked="item.selected">
              {{ item.znak }}
            </n-checkbox>
          </td>
          <td><n-checkbox v-model:checked="item.incash" :disabled="!item.selected" /></td>
          <td><n-checkbox v-model:checked="item.price" :disabled="!item.selected" /></td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row {
  display: flex;
  gap: 1rem;
}
</style>
