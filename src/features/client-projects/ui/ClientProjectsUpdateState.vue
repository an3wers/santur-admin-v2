<script setup lang="ts">
import { NSpace, NFormItem, NInputNumber, NButton, useMessage } from 'naive-ui'
import { useUpdateState } from '../model/use-update-state'
import { ClientProjectsStatusesSelector, useStatuses } from '~/entities/client-projects'

const { projectId, status, cost, bonus } = defineProps<{
  projectId: number
  status: string
  cost: number
  bonus: number
}>()

const emits = defineEmits<{
  (e: 'onUpdatedState'): void
}>()

const {
  updateProjectState,
  bonusValue,
  statusValue,
  costValue,
  updateStatus,
  stateIsChanged,
  updateErrors
} = useUpdateState({
  projectId,
  status,
  cost,
  bonus
})

const { data: statusOptionsData, status: statusOptionsStatus } = useStatuses()

const message = useMessage()
async function updateHandler() {
  await updateProjectState()

  if (updateStatus.value === 'error') {
    updateErrors.value.forEach((err) => {
      message.error(err)
    })
    return
  }

  if (updateStatus.value === 'success') {
    message.success('Данные успешно сохранены')
    emits('onUpdatedState')
  }
}
</script>

<template>
  <n-space vertical size="large">
    <n-form-item :label-props="{ for: 'status' }" label="Статус" :show-feedback="false">
      <ClientProjectsStatusesSelector
        v-model:status="statusValue"
        :async-status="statusOptionsStatus"
        :status-options="statusOptionsData as any"
      />
    </n-form-item>
    <n-form-item :label-props="{ for: 'sum' }" label="Сумма" :show-feedback="false">
      <n-input-number
        v-model:value="costValue"
        placeholder="Введите сумму"
        clearable
        style="width: 100%"
        :min="0"
        :input-props="{ id: 'sum' }"
        :show-button="false"
        :default-value="0"
      />
    </n-form-item>
    <n-form-item :label-props="{ for: 'points' }" label="Баллы" :show-feedback="false">
      <n-input-number
        v-model:value="bonusValue"
        placeholder="Введите баллы"
        style="width: 100%"
        clearable
        :min="0"
        :input-props="{ id: 'points' }"
        :show-button="false"
        :default-value="0"
      />
    </n-form-item>
    <n-space justify="end">
      <!-- <n-button>Отмена</n-button> -->
      <n-button type="primary" @click="updateHandler" :disabled="!stateIsChanged"
        >Сохранить</n-button
      >
    </n-space>
  </n-space>
</template>
