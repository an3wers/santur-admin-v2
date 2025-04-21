<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/page-title/PageTitle.vue'
import { useBannersCategory, BannersListUi as BannersList } from '@/entities/banner'

const route = useRoute()
const { catId } = route.params

const navStore = useNavStore()

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === parseInt(catId as string))
    ?.label
})

const { data, setPage, status, execute } = await useBannersCategory(
  catId as string,
  navStore.activeResource
)

function updateBannerHandler() {
  execute()
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Баннеры" has-back :back-path="`/banners`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <BannersList
        v-if="status === 'success'"
        :banners="data?.items ?? []"
        :ownert-id="navStore.secondLevelId"
        @on-update="updateBannerHandler"
      />
    </n-space>
  </div>
</template>

<style scoped></style>
