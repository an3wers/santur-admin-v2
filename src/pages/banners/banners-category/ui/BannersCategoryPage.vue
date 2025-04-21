<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/page-title/PageTitle.vue'
import BannersList from './BannersList.vue'
import { useBannersCategory } from '../model/use-banners-category'
import { useBannersCategoryData } from '../model/use-banners-category-data'

const route = useRoute()
const { catId } = route.params

const navStore = useNavStore()

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === parseInt(catId as string))
    ?.label
})

const { setPage, page, search, sort } = useBannersCategory()

const { data, status, error } = useBannersCategoryData({
  catId: catId as string,
  app: navStore.activeResource,
  page,
  search,
  sort
})
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Баннеры" has-back :back-path="`/banners`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      {{ (status, error) }}
      <!-- <BannersList v-if="data" :banners="data" /> -->
    </n-space>
  </div>
</template>

<style scoped></style>
