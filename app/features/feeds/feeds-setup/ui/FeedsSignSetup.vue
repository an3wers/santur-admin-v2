<script setup lang="ts">
import { NTable, NCheckbox } from 'naive-ui'
import type { FeedFilterRes } from '~/entities/feeds'

const model = defineModel<FeedFilterRes['znaks']>('state', { required: true })
</script>

<template>
  <n-table :bordered="false" size="small" class="table-el">
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

.table-el tr:hover td {
  background-color: rgba(247, 247, 250, 1);
}
</style>
