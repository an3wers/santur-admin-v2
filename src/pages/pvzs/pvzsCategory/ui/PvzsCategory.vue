<script setup lang="ts">
import { NSpace, NH1, useMessage, NP, NButton, NIcon } from 'naive-ui'
import { PvzsList, usePvzs } from '~/entities/pvzs'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/PageTitle/PageTitle.vue'
import { Plus } from '@vicons/tabler'

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
