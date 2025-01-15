<script setup lang="ts">
import { NH1, NSpace } from 'naive-ui'
import { PvzsItemCard, usePvzsItemStore } from '~/entities/pvzs'

const route = useRoute()
const { catId } = route.params
const title = 'Новый пункт выдачи'

const pvzsItemStore = usePvzsItemStore()

pvzsItemStore.$reset()

pvzsItemStore.pvzsItemSecondaryFields.ownerid = parseInt(catId as string)
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title
        back-label="Все пункты выдачи"
        has-back
        :back-path="`/pvzs/${$route.params.catId}`"
      >
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <PvzsItemCard />
    </n-space>
  </div>
</template>

<style scoped></style>
