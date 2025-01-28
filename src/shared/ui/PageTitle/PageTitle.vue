<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { Pencil, ArrowNarrowLeft } from '@vicons/tabler'

interface Props {
  hasEdit?: boolean
  isFixed?: boolean // ?
  hasBack?: boolean
  backPath?: string
  backLabel?: string
}

const { backPath = '/', backLabel = 'Назад' } = defineProps<Props>()

const emits = defineEmits<{
  (e: 'onEdit'): void
}>()

const editHandler = () => emits('onEdit')

function backHandler() {
  navigateTo({ path: backPath })
}
</script>

<template>
  <div class="header-wrap">
    <div v-if="hasBack">
      <n-button text @click="backHandler">
        <template #icon>
          <n-icon size="20px">
            <ArrowNarrowLeft />
          </n-icon>
        </template>
        {{ backLabel }}
      </n-button>
    </div>
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
            </n-icon>
          </template>
          Изменить
        </n-button>
      </div>
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
