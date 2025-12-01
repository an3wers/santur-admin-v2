<script setup lang="ts">
import { NCard, NSpace, NText, NButton, NIcon, NSpin, useMessage, NSwitch } from 'naive-ui'
import type { SubjectItem } from '../../model/types'
import { useCatalogSetup } from '../../model/use-catalog-setup'
import CategoriesList from './CategoriesList.vue'
import { X as XIcon, ArrowNarrowLeft } from '@vicons/tabler'

const { subject } = defineProps<{
  subject: SubjectItem
}>()

const emits = defineEmits<{
  (e: 'onClose'): void
}>()

const isExpanded = ref(false)

const {
  loading,
  categoriesData,
  filterData,
  saveFilterSubject,
  brandsFilter,
  updateBrandsFilter,
  saveFilterSubjectStatus
} = useCatalogSetup(() => subject)

const message = useMessage()

async function saveFilterSubjectHandler() {
  await saveFilterSubject()

  if (saveFilterSubjectStatus.value === 'success') {
    message.success('Настройка успешно сохранена')
  } else if (saveFilterSubjectStatus.value === 'error') {
    message.success('Произошла ошибка')
  }
}
</script>

<template>
  <n-card>
    <n-space vertical>
      <div>
        <n-button
          size="medium"
          text
          :disabled="saveFilterSubjectStatus === 'pending' || loading"
          @click="$emit('onClose')"
        >
          <template #icon>
            <n-icon size="20px">
              <ArrowNarrowLeft />
            </n-icon>
          </template>
          Назад
        </n-button>
      </div>
      <n-space justify="space-between" align="start">
        <div class="subject-info">
          <h2>{{ subject.name }}</h2>
          <div class="subject-info-details">
            <n-text :depth="3">Код: {{ subject.code || '-' }}</n-text>
            <n-text :depth="3">ИНН: {{ subject.inn || '-' }}</n-text>
            <n-text :depth="3">ТА: {{ subject.taemail || '-' }}</n-text>
          </div>
        </div>
        <div class="action-group">
          <n-button
            size="medium"
            type="primary"
            :disabled="loading"
            :loading="saveFilterSubjectStatus === 'pending'"
            @click="saveFilterSubjectHandler"
          >
            Сохранить настройку
          </n-button>
          <n-button
            size="medium"
            secondary
            strong
            :disabled="saveFilterSubjectStatus === 'pending' || loading"
            @click="$emit('onClose')"
          >
            <template #icon>
              <n-icon>
                <XIcon />
              </n-icon>
            </template>
            Закрыть
          </n-button>
        </div>
      </n-space>
      <n-space :align="'baseline'">
        <n-text tag="h4">Персональный каталог</n-text>

        <!-- <n-space justify="space-between">
          <n-space style="padding-left: 1.25rem; margin-bottom: 0.25rem" size="small">
            <n-text :depth="3" style="font-weight: 500; font-size: small">Раскрыть все</n-text>
            <n-switch v-model:value="isExpanded" id="switch" size="small" />
          </n-space>
        </n-space> -->
      </n-space>
      <n-spin :show="loading">
        <CategoriesList
          v-if="categoriesData?.data"
          :subject-id="subject.id"
          :expanded-all="isExpanded"
          :brands-filter="brandsFilter"
          @on-update-brands-filter="updateBrandsFilter"
        />
        <div v-else style="height: 100px"></div>
      </n-spin>
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
