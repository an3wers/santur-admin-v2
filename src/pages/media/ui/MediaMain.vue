<script setup lang="ts">
import { MediaList, type MediaListType, type MediaListItem, MediaView } from '~/entities/media'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/page-title/PageTitle.vue'
import { NH1, NButton, NUpload, NModal } from 'naive-ui'

const navStore = useNavStore()

const showMediaView = ref(false)
const selectedMedia = ref<MediaListItem | null>(null)

function openMediaHanler(mediaId: number) {
  const item = getMediaFile(mediaId)
  if (item) {
    selectedMedia.value = item
    showMediaView.value = true
  }
}

function getMediaFile(mediaId: number): MediaListItem | undefined {
  const { data } = useNuxtData<MediaListType>('media-list') // TODO: Вынести key в константы
  return data.value?.files.items.find((item) => item.id === mediaId)
}

watch(showMediaView, (newVal) => {
  if (!newVal) {
    selectedMedia.value = null
  }
})

async function updateMediaList() {
  refreshNuxtData('media-list') // TODO: Вынести key в константы
  closeMediaView()
}

function closeMediaView() {
  showMediaView.value = false
}
</script>

<template>
  <div class="media-container">
    <media-list @on-media-open="openMediaHanler">
      <template #header="{ onUpload }">
        <page-title back-label="Главная" has-back :back-path="`/`">
          <template #title>
            <n-h1>
              {{ navStore.currentNavigationMenu?.label }}
            </n-h1>
          </template>
          <template #actions>
            <n-upload multiple :show-file-list="false" :max="50" @change="onUpload">
              <n-button attr-type="button" type="primary">Загрузить файл</n-button>
            </n-upload>
          </template>
        </page-title>
      </template>
    </media-list>
    <n-modal
      size="medium"
      style="width: 640px"
      :title="selectedMedia?.fileName"
      preset="card"
      v-model:show="showMediaView"
    >
      <MediaView v-if="selectedMedia" :media-item="selectedMedia" @on-update="updateMediaList" />
      <!-- TODO: Обработать selectedMedia = null -->
    </n-modal>
  </div>
</template>

<style scoped lang="css">
.media-container {
  height: 100%;
  margin: 0 auto;
  padding: 1rem 1rem;
  width: 100%;
}
</style>
