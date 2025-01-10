<script setup lang="ts">
import { NSpace, NH1, useMessage } from 'naive-ui'
import { PvzsList, usePvzs } from '~/entities/pvzs'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/PageTitle/PageTitle.vue'

const route = useRoute()

const navStore = useNavStore()
const { catId } = route.params
const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === parseInt(catId as string))
    ?.label
})

const { data, status, error } = await usePvzs(catId as string)

const message = useMessage()

if (status.value === 'error') {
  message.error(error.value?.message ?? 'На странице произошла ошибка')
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title>
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <PvzsList v-if="data" :pvzs="data" />
    </n-space>
  </div>
</template>

<style scoped></style>
