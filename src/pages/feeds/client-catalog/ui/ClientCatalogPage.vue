<script setup lang="ts">
import { NSpace, NH1, NText, NCard, NButton, NIcon, NSpin } from 'naive-ui'
import ClientSelector from '~/features/feeds/client-catalog-setup/ui/ClientSelector.vue'
import { useCatalogSetup } from '~/features/feeds/client-catalog-setup'
import CatalogSetup from '~/features/feeds/client-catalog-setup/ui/CatalogSetup/CatalogSetup.vue'
import { X as XIcon } from '@vicons/tabler'

const {
  currentSubject,
  setCurrentSubject,
  clearSubject,
  loading,
  categoriesData,
  filterData,
  saveFilterSubject
} = useCatalogSetup()
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Выгрузки" has-back :back-path="`/feeds`">
        <template #title>
          <n-h1>Настройка по клиентам</n-h1>
        </template>
      </page-title>
    </n-space>
    <n-space vertical size="large">
      <ClientSelector @on-select-subject="setCurrentSubject" />

      <n-card v-if="currentSubject">
        <n-space vertical>
          <n-space justify="space-between" align="start">
            <div class="subject-info">
              <h2>{{ currentSubject.name }}</h2>
              <div class="subject-info-details">
                <n-text :depth="3">Код: {{ currentSubject.code }}</n-text>
                <n-text :depth="3">ИНН: {{ currentSubject.inn }}</n-text>
                <n-text :depth="3">ТА: {{ currentSubject.taemail }}</n-text>
              </div>
            </div>
            <div class="action-group">
              <n-button size="medium" type="primary" @click="saveFilterSubject">
                Сохранить настройку
              </n-button>
              <n-button size="medium" secondary strong @click="clearSubject">
                <template #icon>
                  <n-icon>
                    <XIcon />
                  </n-icon>
                </template>
                Закрыть
              </n-button>
            </div>
          </n-space>
          <n-spin :show="loading">
            <CatalogSetup v-if="categoriesData?.data" v-model:categories="categoriesData.data" />
            <div v-else style="height: 100px"></div>
          </n-spin>
        </n-space>
      </n-card>

      <div v-else style="height: 100px; display: flex; align-items: center">
        <n-text tag="p" depth="3" style="text-align: center; width: 100%"
          >Выберите клиента для настройки через поиск</n-text
        >
      </div>
    </n-space>
  </div>
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
