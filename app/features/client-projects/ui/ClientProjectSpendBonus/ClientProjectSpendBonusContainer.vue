<script setup lang="ts">
import { NSpace, NAlert, NTabs, NTab, NText } from 'naive-ui'
import ClientProjectSpendBonusHistory from './ClientProjectSpendBonusHistory.vue'
import ClientProjectSpendBonusRequests from './ClientProjectSpendBonusRequests.vue'

interface Subject {
  id: number
  name: string
  bonusSum: number
  requestedBonusTospend: number
}

const { subject } = defineProps<{
  subject: Subject
}>()

const mode = ref<'spend' | 'history'>('spend')
</script>

<template>
  <n-space vertical size="large">
    <n-alert :show-icon="false">
      <ul class="subject-info">
        <li class="subject-info__item">
          <n-text depth="3" class="subject-info__label">Клиент</n-text>
          <n-text strong>{{ subject.name }}</n-text>
        </li>
        <li class="subject-info__item">
          <n-text depth="3" class="subject-info__label">Общее количество баллов</n-text>
          <n-text strong>{{ subject.bonusSum }}</n-text>
        </li>
      </ul>
    </n-alert>

    <n-tabs v-model:value="mode" type="line" style="margin-bottom: 0.5rem">
      <n-tab name="spend"> Запросы на списание </n-tab>
      <n-tab name="history"> История </n-tab>
    </n-tabs>

    <ClientProjectSpendBonusRequests v-if="mode === 'spend'" :subject-id="subject.id" />
    <ClientProjectSpendBonusHistory v-if="mode === 'history'" :subject-id="subject.id" />
  </n-space>
</template>

<style scoped>
.subject-info {
  list-style: none;
  padding: 0;
}

.subject-info__item {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.subject-info__label {
  display: inline-block;
  width: 140px;
  text-align: left;
}
</style>
