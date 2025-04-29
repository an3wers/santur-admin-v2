<script setup lang="ts">
import { NSpace, NH1, NModal } from 'naive-ui'
import { BannerItemCard, userBannerItem } from '~/entities/banner'
import { MediaList, type MediaListItem } from '@/entities/media'

const route = useRoute()

const { itemId, catId } = route.params

const title = ref('')

const { loadBanner, status, banner, removeMedia, selectMedia, isModified } = userBannerItem({
  catId: parseInt(catId as string)
})

await loadBanner(parseInt(itemId as string))

if (status.value === 'error') {
  throw createError({ statusMessage: 'Произошла ошибка при загрузке баннера', statusCode: 400 })
}

if (status.value === 'success') {
  title.value = banner?.name ?? ''
}

const hasMediaManagerModel = ref(false)
function showMediaManager() {
  hasMediaManagerModel.value = true
}

function selectMediaHandler(media: MediaListItem) {
  selectMedia(media.imgPath)
  hasMediaManagerModel.value = false
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Баннеры" has-back :back-path="`/banners/${$route.params.catId}`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>

      <BannerItemCard
        v-model:state="banner"
        :is-modified="isModified"
        :ownert-id="parseInt(catId as string)"
        @on-select-media="showMediaManager"
        @on-remove-media="removeMedia"
      />
    </n-space>
    <n-modal
      style="margin: 24px"
      title="Выберите изображение"
      size="huge"
      preset="card"
      :bordered="false"
      :show="hasMediaManagerModel"
      @close="hasMediaManagerModel = false"
    >
      <media-list media-view-mode="select" @on-media-select="selectMediaHandler"></media-list>
    </n-modal>
  </div>
</template>

<style scoped></style>
