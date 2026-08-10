<script setup lang="ts">
import { NH1, NSpace } from 'naive-ui'
import { usePvzsEditItemStore } from '@/features/pvzs'
import PvzsEditItem from '~/features/pvzs/ui/PvzsEditItem.vue'

const route = useRoute()
const { catId } = route.params
const title = 'Новый пункт выдачи'

const pvzsItemStore = usePvzsEditItemStore()

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
      <PvzsEditItem />
    </n-space>
  </div>
</template>

<style scoped></style>
