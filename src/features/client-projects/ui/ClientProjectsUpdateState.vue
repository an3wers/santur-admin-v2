<script setup lang="ts">
import { NSpace, NSelect, NFormItem, NInputNumber, NButton } from 'naive-ui'
import { useUpdateState } from '../model/use-update-state'
import { statusOptions } from '~/entities/client-projects'

const currentStatus = defineModel<string>('currentStatus')
const currentSum = defineModel<number>('currentSum')
const currentPoints = defineModel<number>('currentPoints')

const { updateProjectState } = useUpdateState()
async function updateHandler() {
  await updateProjectState()
}
</script>

<template>
  <n-space vertical size="large">
    <n-form-item :label-props="{ for: 'status' }" label="Статус" :show-feedback="false">
      <n-select
        v-model:value="currentStatus"
        :input-props="{ id: 'status' }"
        :options="statusOptions"
      />
    </n-form-item>
    <n-form-item :label-props="{ for: 'sum' }" label="Сумма" :show-feedback="false">
      <n-input-number
        v-model:value="currentSum"
        placeholder="Введите сумму"
        clearable
        style="width: 100%"
        :input-props="{ id: 'sum' }"
        :show-button="false"
        :default-value="0"
      />
    </n-form-item>
    <n-form-item :label-props="{ for: 'points' }" label="Баллы" :show-feedback="false">
      <n-input-number
        :input-props="{ id: 'points' }"
        v-model:value="currentPoints"
        placeholder="Введите баллы"
        style="width: 100%"
        clearable
        :show-button="false"
        :default-value="0"
      />
    </n-form-item>
    <n-space justify="end">
      <!-- <n-button>Отмена</n-button> -->
      <n-button type="primary" @click="updateHandler">Сохранить</n-button>
    </n-space>
  </n-space>
</template>
