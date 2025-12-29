<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import { useBannerApi } from '~/entities/banner'
// import { MediaList, type MediaListItem } from '@/entities/media'
// import { userEditBannerItem } from '~/features/banner'
import BannerEditItem from '~/features/banner/ui/BannerEditItem.vue'

const route = useRoute()

const { itemId, catId } = route.params

const title = ref('')

// TODO: Унести в компонент отвечающий за редактирование баннера
// const { loadBanner, status, banner, removeMedia, selectMedia, isModified } = userEditBannerItem({
//   catId: parseInt(catId as string)
// })

// await loadBanner(parseInt(itemId as string))

const { getBanner } = useBannerApi()
const { data, status, error } = await useAsyncData(
  `banner-${String(itemId)}`,
  () => getBanner(Number(itemId as string)),
  {
    lazy: false
  }
)

if (status.value === 'error') {
  throw createError({
    statusCode: 400,
    statusMessage: error.value?.message || 'Произошла ошибка при загрузке баннера',
    fatal: true
  })
}

if (status.value === 'success' && data.value) {
  title.value = data.value.name
}

// const hasMediaManagerModel = ref(false)

// function showMediaManager() {
//   hasMediaManagerModel.value = true
// }

// function selectMediaHandler(media: MediaListItem) {
//   selectMedia(media.imgPath)
//   hasMediaManagerModel.value = false
// }
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Баннеры" has-back :back-path="`/banners/${$route.params.catId}`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>

      <!-- v-model:state="banner" -->
      <!-- :is-modified="isModified" -->
      <!-- @on-remove-media="removeMedia" -->
      <!-- @on-select-media="showMediaManager" -->
      <BannerEditItem :banner="data ?? undefined" :owner-id="Number(catId as string)" />
    </n-space>
    <!-- <n-modal
      style="margin: 24px"
      title="Выберите изображение"
      size="huge"
      preset="card"
      :bordered="false"
      :show="hasMediaManagerModel"
      @close="hasMediaManagerModel = false"
    >
      <media-list media-view-mode="select" @on-media-select="selectMediaHandler"></media-list>
    </n-modal> -->
  </div>
</template>

<style scoped></style>
