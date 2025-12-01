<script setup lang="ts">
import { NCard, NSpace, NText, NButton, NIcon, NSpin, useMessage } from 'naive-ui'
import type { SubjectItem } from '../../model/types'
import { useCatalogSetup } from '../../model/use-catalog-setup'
import CategoriesList from './CategoriesList.vue'
import { X as XIcon } from '@vicons/tabler'

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
      <n-text tag="h4">Персональный каталог</n-text>
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

  <!--
  <n-space vertical>
    <div class="category" v-for="parent in categories" :key="parent.id">
      <div class="parent">
        <span class="parent__item">{{ parent.name }}</span>
        <n-button size="tiny" @click="toggleCheckedAllInCategory(parent.id)">{{
          parent.child?.every((c) => c.isChecked) ? 'Снять все' : 'Выбрать все'
        }}</n-button>
      </div>
      <div class="child" v-for="child in parent.child" :key="child.id">
        <div class="child__item">
          <n-checkbox v-model:checked="child.isChecked">{{ child.name }}</n-checkbox>
          <n-button size="tiny" @click="openBrandsSetting(child.id)">Настроить</n-button>
        </div>
      </div>
    </div>
  </n-space>
  -->
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
