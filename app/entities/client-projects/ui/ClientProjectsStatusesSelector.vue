<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import { type SelectOption, NSelect } from 'naive-ui'
import type { StatusColorType } from '../lib/get-status-color'

const statusValue = defineModel<string>('status', { required: true })

defineProps<{
  statusOptions: (SelectOption & { color?: StatusColorType }[]) | null
  asyncStatus: AsyncDataRequestStatus
}>()

function randerLabel(option: SelectOption & { color?: StatusColorType }, _selected: boolean) {
  return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
    h('span', {
      style: {
        marginRight: '8px',
        height: '8px',
        width: '8px',
        borderRadius: '50%',
        backgroundColor: `${option?.color?.marker || 'transparent'}`
      }
    }),
    h('span', {}, option.label as string)
  ])
}
</script>

<template>
  <n-select
    v-model:value="statusValue"
    :input-props="{ id: 'status' }"
    :options="statusOptions || []"
    :loading="status === 'pending'"
    :render-label="randerLabel"
  />
</template>

<style scoped></style>
