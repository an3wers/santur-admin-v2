<script setup lang="ts">
import { NSpace, NH1, NP, NButton, NIcon } from 'naive-ui'
import { usePvzs } from '../model/use-pvzs-categoty-data'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/page-title/PageTitle.vue'
import { Plus } from '@vicons/tabler'
import PvzsList from './PvzsList.vue'

const route = useRoute()
const { catId } = route.params

const navStore = useNavStore()

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === parseInt(catId as string))
    ?.label
})

const { data, status, error } = await usePvzs(catId as string)

if (status.value === 'error') {
  console.error(error.value?.message ?? 'На странице произошла ошибка')
  throw createError({ statusCode: 400, statusMessage: 'На странице произошла ошибка', fatal: true })
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Пункты выдачи" has-back :back-path="`/pvzs`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
        <template #actions>
          <n-button
            v-if="catId && parseInt(catId as string)"
            type="primary"
            @click="navigateTo({ path: `./${$route.params.catId}/new-item` })"
          >
            <template #icon>
              <n-icon size="20px"><Plus /></n-icon>
            </template>
            Добавить
          </n-button>
        </template>
      </page-title>
      <PvzsList v-if="data && data.length" :pvzs="data" :ownert-id="parseInt(catId as string)" />
      <!-- TODO: Доработь вывод пустого списка -->
      <div v-if="data && !data.length">
        <n-p>Ничего не найдено</n-p>
      </div>
    </n-space>
  </div>
</template>

<style scoped></style>
