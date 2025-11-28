<script setup lang="ts">
import { NSpin, NList, NListItem, NText } from 'naive-ui'
import { useClientCatalogApi } from '~/entities/feeds'

const { selectedManagerEmail } = defineProps<{
  selectedManagerEmail: string
}>()

defineEmits<{
  (e: 'onSelectSubject', subject: unknown): void
  (e: 'onClose'): void
}>()

const { getSubjectsByManagerEmail } = useClientCatalogApi()

// data request
const { data, status } = await useAsyncData(
  `subjects-by-manager-${selectedManagerEmail}`,
  () => getSubjectsByManagerEmail(selectedManagerEmail),
  // TODO: add cache
  {
    lazy: true
  }
)

function selectHandler() {}
</script>

<template>
  <div>
    <n-spin></n-spin>
    <!-- <n-list v-if="data.length > 0" hoverable clickable>
      <n-list-item v-for="item in data" :key="item.id" @click="selectHandler(item)">
        {{ item.name }}
      </n-list-item>
    </n-list> -->
    <!-- <n-text tag="p" style="text-align: center" v-else>Ничего не найдено</n-text> -->
  </div>
</template>

<style scoped></style>
