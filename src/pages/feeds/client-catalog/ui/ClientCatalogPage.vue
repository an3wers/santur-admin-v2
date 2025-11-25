<script setup lang="ts">
import { NSpace, NH1, NText } from 'naive-ui'
import ClientSelector from '~/features/feeds/client-catalog-setup/ui/ClientSelector.vue'
import { useCatalogSetup } from '~/features/feeds/client-catalog-setup'
import CatalogSetup from '~/features/feeds/client-catalog-setup/ui/CatalogSetup/CatalogSetup.vue'

const { currentSubject, setCurrentSubject, clearSubject } = useCatalogSetup()
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
      <CatalogSetup
        v-if="currentSubject"
        :subject="currentSubject"
        @on-close="clearSubject"
        @on-save="() => {}"
      />
      <div v-else style="height: 100px; display: flex; align-items: center">
        <n-text as="p" depth="3" style="text-align: center; width: 100%"
          >Выберите клиента для настройки через поиск</n-text
        >
      </div>
    </n-space>
  </div>
</template>
