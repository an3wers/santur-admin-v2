<script setup lang="ts">
import { NH1, NSpace, NP } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()
</script>
<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Главная" has-back :back-path="`/`">
        <template #title>
          <n-h1>
            {{ navStore.currentNavigationMenu?.label }}
          </n-h1>
        </template>
      </page-title>
      <n-p>Раздел в стадии разработки</n-p>
    </n-space>
  </div>
</template>
