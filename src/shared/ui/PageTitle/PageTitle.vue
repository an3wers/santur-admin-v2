<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { Pencil } from '@vicons/tabler'

interface Props {
  hasEdit?: boolean
  isFixed?: boolean
}

const { isFixed = false, hasEdit = false } = defineProps<Props>()

const emits = defineEmits<{
  (e: 'onEdit'): void
}>()

const editHandler = () => emits('onEdit')
</script>

<template>
  <div class="header-container">
    <div class="title">
      <slot name="title" />
    </div>
    <div class="actions">
      <slot name="actions" />
      <n-button v-if="hasEdit" @click="editHandler" secondary type="primary">
        <template #icon>
          <n-icon size="20px">
            <Pencil />
            <!-- <EditIcon color="#1976d2" /> -->
          </n-icon>
        </template>
        Изменить
      </n-button>
    </div>
  </div>
</template>

<style scoped lang="css">
.header-container {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  align-self: flex-start;
}
.title h1 {
  margin-bottom: 0 !important;
}
.actions {
  padding-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
</style>
