<script setup lang="ts">
import {
  NSpace,
  NSpin,
  NUpload,
  NUploadDragger,
  NGrid,
  NGridItem,
  NCard,
  NButton,
  NPagination,
  useMessage,
  NText,
  NIcon
} from 'naive-ui'
import { useMediaList } from '../model/use-media-list'
import { Trash, File } from '@vicons/tabler'
import { useUploadMedia } from '../model/use-upload-media'
import { useDeleteMedia } from '../model/use-delete-media'
import type { MediaListItem, OptionsType } from '../model/media-types'
import { checkIsImage } from '../libs/check-is-image'

const { mediaViewMode = 'open' } = defineProps<{
  mediaViewMode?: 'open' | 'select'
}>()

const emits = defineEmits<{
  (e: 'onMediaSelect', media: MediaListItem): void
  (e: 'onMediaOpen', id: number): void
}>()

const message = useMessage()
const { data, status, page, error, refresh } = useMediaList()
const { status: ulpoadStatus, setFileToList, uploadFilesDebounce } = useUploadMedia()
const { deleteFile, status: deleteStatus } = useDeleteMedia()

if (status.value === 'error') {
  message.error(error.value?.message ?? 'На странице произошла ошибка')
}

function mediaItemHandler(media: MediaListItem) {
  if (mediaViewMode === 'open') {
    emits('onMediaOpen', media.id)
  } else if (mediaViewMode === 'select') {
    emits('onMediaSelect', media)
  }
}

async function deleteItem(id: number) {
  await deleteFile(id.toString())
  if (deleteStatus.value === 'error') {
    message.error('Произошла ошибка при удалении файла')
  }

  if (deleteStatus.value === 'success') {
    await refresh()
    message.success('Файл успешно удален')
  }
}

async function uploadItems(options: OptionsType) {
  const { file } = options

  if (!file.file) {
    return
  }

  setFileToList(file.file)

  await uploadFilesDebounce()
}

function cropFileName(fileName: string, ext?: string) {
  let result = ''
  if (fileName.length > 16) {
    result = `${fileName.slice(0, 16)}…${fileName.slice(fileName.length - 4, fileName.length)}`
  } else {
    result = fileName
  }

  if (ext) {
    result = ext.at(0) === '.' ? `${result}${ext}` : `${result}.${ext}`
  }

  return result
}

watchEffect(() => {
  if (ulpoadStatus.value === 'error') {
    message.error('Произошла ошибка при загрузке файлов')
  }

  if (ulpoadStatus.value === 'success') {
    refresh()
    message.success('Файлы успешно загружены')
  }
})
</script>

<template>
  <div class="media-list-container">
    <n-space vertical size="large">
      <slot name="header" :on-upload="uploadItems"></slot>
      <n-spin :show="status === 'pending'">
        <n-upload
          v-if="status !== 'error'"
          multiple
          directory-dnd
          :max="50"
          :show-file-list="false"
          @change="uploadItems"
        >
          <n-upload-dragger>
            <n-grid v-if="data" :x-gap="12" :y-gap="12" cols="s:4 m:5 l:6 xl:8" responsive="screen">
              <n-grid-item v-for="media in data.files.items" :key="media.id">
                <n-card
                  class="n-card-item"
                  size="small"
                  :hoverable="true"
                  @click.stop="mediaItemHandler(media)"
                >
                  <template #cover>
                    <img
                      v-if="checkIsImage(media.ext)"
                      :src="media.imgPath"
                      :alt="media.fileName"
                    />
                    <div v-else class="media-default">
                      <n-icon size="40px" depth="3">
                        <File />
                      </n-icon>
                    </div>
                  </template>
                  <template #action>
                    <n-text class="media-title" :title="media.fileName">
                      {{ cropFileName(media.fileName, media.ext) }}
                    </n-text>
                  </template>
                  <n-button
                    class="options-btn"
                    secondary
                    type="error"
                    circle
                    @click.stop="deleteItem(media.id)"
                  >
                    <n-icon size="20px">
                      <Trash />
                    </n-icon>
                  </n-button>
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-upload-dragger>
        </n-upload>
      </n-spin>
      <div class="media-pagination">
        <NPagination v-model:page="page" :page-count="data?.files.totalPages" />
      </div>
    </n-space>
  </div>
</template>

<style scoped>
/* .media-list-container {
} */

.media-pagination {
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}

.n-card-item {
  position: relative;
  height: 100%;
}

.n-card-cover {
  flex-shrink: 0;
  height: 160px;
}

.n-card-cover > img {
  object-fit: contain;
  width: 100%;
  height: 160px;
}

.n-card-item > .n-card-header .n-card-header__main {
  text-wrap: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-container {
  padding: 1rem 1rem 3rem 1rem;
}
.options-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  display: none;
}

.n-card-item:hover .options-btn {
  display: flex;
}

.media-title {
  font-size: 0.75rem;
  line-height: 1.3;
}

.media-default {
  height: 160px;
  width: 100%;
  background-color: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
