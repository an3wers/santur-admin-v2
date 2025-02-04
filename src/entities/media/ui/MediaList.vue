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
import { useMediaList } from '../libs/useMediaList'
import { Trash } from '@vicons/tabler'
import { useUploadMedia } from '../libs/useUploadMedia'
import type { OptionsType } from '../libs/types'
import { useDeleteMedia } from '../libs/useDeleteMedia'

const { mediaViewMode = 'open' } = defineProps<{
  mediaViewMode?: 'open' | 'select'
}>()

const emits = defineEmits<{
  (e: 'onMediaSelect', id: number): void
  (e: 'onMediaOpen', id: number): void
}>()

const message = useMessage()
const { status: ulpoadStatus, setFileToList, uploadFilesDebounce } = useUploadMedia()
const { data, status, page, error, refresh } = useMediaList()
const { deleteFile, status: deleteStatus } = useDeleteMedia()

if (status.value === 'error') {
  message.error(error.value?.message ?? 'На странице произошла ошибка')
}

function mediaHandler(id: number) {
  if (mediaViewMode === 'open') {
    emits('onMediaOpen', id)
  } else if (mediaViewMode === 'select') {
    emits('onMediaSelect', id)
  }
}

async function deleteHandler(id: number) {
  await deleteFile(id.toString())
  if (deleteStatus.value === 'error') {
    message.error('Произошла ошибка при удалении файла')
  }

  if (deleteStatus.value === 'success') {
    await refresh()
    message.success('Файл успешно удален')
  }
}

async function uploadHandler(options: OptionsType) {
  const { file } = options

  if (!file.file) {
    return
  }

  setFileToList(file.file)

  await uploadFilesDebounce()
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
      <slot name="header" :on-upload="uploadHandler"></slot>
      <n-spin :show="status === 'pending'">
        <n-upload
          v-if="status !== 'error'"
          multiple
          directory-dnd
          :max="50"
          :show-file-list="false"
          @change="uploadHandler"
        >
          <n-upload-dragger>
            <n-grid v-if="data" :x-gap="12" :y-gap="12" cols="s:4 m:5 l:6 xl:8" responsive="screen">
              <n-grid-item v-for="media in data.files.items" :key="media.id">
                <n-card
                  class="n-card-item"
                  size="small"
                  :hoverable="true"
                  @click.stop="mediaHandler(media.id)"
                >
                  <template #cover>
                    <img :src="media.imgPath" :alt="media.fileName" />
                  </template>
                  <template #action>
                    <n-text class="media-title" :title="media.fileName">
                      {{
                        media.fileName.length > 16
                          ? media.fileName.slice(0, 16) +
                            '…' +
                            media.fileName.slice(media.fileName.length - 4, media.fileName.length)
                          : media.fileName
                      }}
                    </n-text>
                  </template>
                  <n-button
                    class="options-btn"
                    secondary
                    type="error"
                    circle
                    @click.stop="deleteHandler(media.id)"
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
</style>
