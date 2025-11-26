<script setup lang="ts">
import { NInput, NIcon } from 'naive-ui'
import type { Size } from 'naive-ui/es/input/src/interface'
import { Search } from '@vicons/tabler'

const {
  size = 'medium',
  disabled = false,
  placeholder = 'Поиск...',
  delay = 600,
  modelValue
} = defineProps<{
  modelValue: string
  size?: Size
  disabled?: boolean
  placeholder?: string
  delay?: number
}>()

const _search = ref(modelValue ?? '')

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const emitValueWitchDebounce = useDebounceFn(
  (value: string) => emit('update:modelValue', value),
  delay
)

watch(_search, (value) => emitValueWitchDebounce(value))
</script>

<template>
  <!-- <n-input
    type="text"
    :value="modelValue"
    :size="size"
    :disabled="disabled"
    :placeholder="placeholder"
    @input="emitValueWitchDebounce"
    clearable
  >
    <template #prefix>
      <n-icon size="20px">
        <Search color="#94a3b8" />
      </n-icon>
    </template>
  </n-input> -->
  <n-input
    type="text"
    v-model:value="_search"
    :size="size"
    :disabled="disabled"
    :placeholder="placeholder"
    clearable
  >
    <template #prefix>
      <n-icon size="20px">
        <Search color="#1976d2" />
      </n-icon>
    </template>
  </n-input>
</template>

<style scoped></style>
