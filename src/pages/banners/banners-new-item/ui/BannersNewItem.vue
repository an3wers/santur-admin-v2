<script setup lang="ts">
import { NSpace, NH1, NModal } from 'naive-ui'
import { MediaList, type MediaListItem } from '@/entities/media'
import { userEditBannerItem } from '~/features/banner'
import BannerEditItem from '~/features/banner/ui/BannerEditItem.vue'

const title = ref('Новый баннер')

const route = useRoute()

const { catId } = route.params
const { banner, removeMedia, selectMedia, isModified } = userEditBannerItem({
  catId: parseInt(catId as string)
})

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

      <BannerEditItem
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
