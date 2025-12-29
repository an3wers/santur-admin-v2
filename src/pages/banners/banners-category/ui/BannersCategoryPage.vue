<script setup lang="ts">
import { NSpace, NH1, NButton, NIcon, NModal } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/page-title/PageTitle.vue'
import { Plus, Edit } from '@vicons/tabler'
import { CategoryDetail } from '~/entities/category'
import { useBannersCategory } from '../model/use-banners-category-data'
import BannersList from './BannersList.vue'

const route = useRoute()
const { catId } = route.params

const navStore = useNavStore()

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === Number(catId as string))?.label
})

const { data, page, setPage, execute } = await useBannersCategory(
  Number(catId as string),
  navStore.activeResource
)

function updateBannerHandler() {
  return execute()
}

const isShowEditCategory = ref(false)

function toggleEditCategory() {
  isShowEditCategory.value = !isShowEditCategory.value
}

async function updateCategoryHandler() {
  await navStore.loadMenu(navStore.activeResource)
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Баннеры" has-back :back-path="`/banners`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
        <template #actions>
          <!-- v-if="catId && parseInt(catId as string)" -->
          <n-button
            type="primary"
            @click="navigateTo({ path: `./${$route.params.catId}/new-item` })"
          >
            <template #icon>
              <n-icon size="20px"><Plus /></n-icon>
            </template>
            Добавить
          </n-button>
          <n-button secondary type="primary" @click="toggleEditCategory">
            <template #icon>
              <n-icon size="20px"><Edit /></n-icon>
            </template>
            Изменить
          </n-button>
        </template>
      </page-title>
      <BannersList
        :banners="data?.items ?? []"
        :ownert-id="navStore.secondLevelId"
        :page="page"
        :total-pages="data?.totalPages ?? 0"
        @on-change-page="setPage"
        @on-update="updateBannerHandler"
      />
    </n-space>
    <n-modal
      style="max-width: 640px"
      size="medium"
      preset="card"
      v-model:show="isShowEditCategory"
      :title="title"
    >
      <CategoryDetail
        :id="parseInt(catId as string)"
        :first-level-name="navStore.firstLevelName"
        @on-cancel="toggleEditCategory"
        @on-update="updateCategoryHandler"
      />
    </n-modal>
  </div>
</template>

<style scoped></style>
