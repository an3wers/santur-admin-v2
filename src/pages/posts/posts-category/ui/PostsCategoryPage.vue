<script setup lang="ts">
import { NSpace, NH1, NButton, NIcon, NModal } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/page-title/PageTitle.vue'
import { Plus, Edit } from '@vicons/tabler'
import { usePostsCategory } from '../model/use-posts-category'
import { CategoryDetail } from '~/entities/category'
import PostsList from './PostsList.vue'

const route = useRoute()
const { catId } = route.params

const navStore = useNavStore()

const catName = computed(
  () =>
    navStore.currentNavigationMenu?.items.find((el) => el.id === parseInt(catId as string))
      ?.label ?? ''
)

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === parseInt(catId as string))
    ?.label
})

const { data, status, page, setPage, search, execute } = await usePostsCategory(
  catId as string,
  navStore.activeResource
)

if (status.value === 'error') {
  throw createError({ statusMessage: 'На странице произошла ошибка', statusCode: 404, fatal: true })
}

const isShowEditCategory = ref(false)

function toggleEditCategory() {
  isShowEditCategory.value = !isShowEditCategory.value
}

function updatePostsHandler() {
  execute()
}

async function updateCategoryHandler() {
  await navStore.loadMenu(navStore.activeResource)
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Страницы" has-back :back-path="`/posts`">
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
          <n-button secondary type="primary" @click="toggleEditCategory">
            <template #icon>
              <n-icon size="20px"><Edit /></n-icon>
            </template>
            Изменить
          </n-button>
        </template>
      </page-title>
      <PostsList
        v-if="status !== 'error'"
        :posts="data?.items ?? []"
        :ownert-id="parseInt(catId as string)"
        :owner-name="catName"
        :page="page"
        :search="search"
        :total-pages="data?.totalPages ?? 0"
        @on-change-page="setPage"
        @on-update="updatePostsHandler"
      >
        <template #search>
          <InputSearch v-model="search" />
        </template>
      </PostsList>
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
