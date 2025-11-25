<script setup lang="ts">
import { NCard, NSpace, NText, NButton, NIcon } from 'naive-ui'
import { X as XIcon } from '@vicons/tabler'
import type { SubjectItem } from '../../model/types'
import { useClientCatalogApi } from '~/entities/feeds'

const { subject } = defineProps<{
  subject: SubjectItem
}>()

const emits = defineEmits<{
  (e: 'onClose'): void
  (e: 'onSave'): void
}>()
const { getFilterSubject } = useClientCatalogApi()

const { data, status } = useAsyncData(`filter-subject-${subject.id}`, () =>
  getFilterSubject(subject.id)
)
</script>

<template>
  <n-card>
    <n-space justify="space-between" align="start">
      <div class="subject-info">
        <h2>{{ subject.name }}</h2>
        <div class="subject-info-details">
          <n-text :depth="3">Код: {{ subject.code }}</n-text>
          <n-text :depth="3">ИНН: {{ subject.inn }}</n-text>
          <n-text :depth="3">ТА: {{ subject.taemail }}</n-text>
        </div>
      </div>
      <div class="action-group">
        <n-button size="medium" type="primary" @click="emits('onSave')">
          Сохранить настройку
        </n-button>
        <n-button size="medium" secondary strong @click="emits('onClose')">
          <template #icon>
            <n-icon>
              <XIcon />
            </n-icon>
          </template>
          Закрыть
        </n-button>
      </div>
    </n-space>
  </n-card>
</template>

<style scoped>
.subject-info {
}

.subject-info h2 {
  margin: 0;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.subject-info-details {
  display: flex;
  gap: 0.5rem;
}
</style>
